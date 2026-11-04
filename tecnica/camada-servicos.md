# Camada de serviços

Fronteira entre a aplicação e o backend. Feature nunca fala com o banco.

## Arquivos de um domínio

| Arquivo              | Responsabilidade                    |
| -------------------- | ----------------------------------- |
| `<dom>.types.ts`     | schema Valibot e tipo de domínio    |
| `<dom>.api.ts`       | leitura                             |
| `<dom>.mutations.ts` | escrita e RPC                       |
| `<dom>.keys.ts`      | chaves de cache                     |
| `<dom>.queries.ts`   | definições de query reaproveitáveis |
| `index.ts`           | superfície pública                  |

Arquivo interno nunca importa do `index.ts` do próprio domínio.

## Tipo de domínio

O service devolve tipo de domínio em `camelCase`. A row em `snake_case`
não vaza para a feature — é isso que desacopla a UI do schema.

```ts
// pedidos.types.ts
export const PedidoSchema = v.object({
  id: v.string(),
  dataVenda: v.string(),
  total: v.number(),
  valorPago: v.number(),
  status: v.picklist(['pago', 'parcial', 'em_aberto']),
  clienteNome: v.string(),
})

export type Pedido = v.InferOutput<typeof PedidoSchema>
```

## Cliente do banco

A mesma função roda no servidor (prefetch) e no cliente (refetch), e cada
lado tem seu cliente: `createClient()` de `@supabase/client` (browser) ou
de `@supabase/server` (servidor) — dois módulos com o mesmo nome de
função, nunca importados ao mesmo tempo num arquivo. O cliente entra por
parâmetro, com o do browser como padrão, porque o valor padrão só é
avaliado quando o argumento é omitido — e o Server Component sempre passa
o seu:

```ts
// pedidos.api.ts
import { createClient } from '@supabase/client'

export async function getPedidos(
  filtros: PedidosFiltros,
  db: Db = createClient(),
): Promise<Pedido[]> {
  let q = db
    .from('pedidos')
    .select('id, data_venda, total, valor_pago, status, clientes(nome)')
    .is('deleted_at', null)

  if (filtros.clienteId) q = q.eq('cliente_id', filtros.clienteId)
  if (filtros.de) q = q.gte('data_venda', filtros.de)

  const { data, error } = await q
    .order('data_venda', { ascending: false })
    .range(filtros.offset, filtros.offset + 24)

  if (error) throw error
  return v.parse(v.array(PedidoSchema), data.map(toPedido))
}
```

Server Component passa o cliente de servidor; Client Component omite.

## Quando a leitura vira RPC (Fases 8, 9 e 10)

O exemplo acima usa o construtor de query, e ele basta para lista simples
(`clientes`). Não basta em três situações, e nas três o domínio expõe uma
função SQL em vez de encadear `.select()`:

| Situação                                                      | Por quê                                                                                                                                                                                                                                                                                                                                                               | Onde                                            |
| ------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| O filtro atravessa a tabela filha                             | `!inner` join duplica o pai quando o filho casa duas vezes: a mesma venda aparece duas vezes e a contagem da paginação sai errada, sem sintoma. Resolve-se com `exists`, que o construtor não expressa                                                                                                                                                                | `listar_pedidos`                                |
| A tela mostra KPI do filtro inteiro                           | Somar o array recebido daria a soma **da página** — um número plausível, errado, que ninguém confere                                                                                                                                                                                                                                                                  | `resumir_pedidos`, `resumir_pagamentos`         |
| A linha carrega um valor derivado de outra tabela             | "falta R$ 340,00" na coluna "Onde foi aplicado" precisa do saldo do pedido, que a linha de pagamento não tem. Montar a frase na tela com o que estiver à mão produz um valor plausível e errado                                                                                                                                                                       | `listar_pagamentos`                             |
| A tela precisa percorrer a fila **na ordem do banco**         | A prévia de alocação simula onde o dinheiro vai cair. Ela só é honesta se caminhar os pedidos no mesmo predicado e na mesma ordem que `realocar_pagamentos_do_cliente` percorre — `listar_pedidos` não serve, porque `p_status` aceita um valor e a fila é `em_aberto` **e** `parcial`                                                                                | `pedidos_em_aberto`                             |
| A tela mostra **duas tabelas intercaladas**, com um acumulado | O extrato precisa de pedidos e pagamentos numa linha do tempo só, com o saldo somando linha a linha — e é esse acumulado que decide onde a conta zerou, e portanto onde o documento de cobrança começa. O construtor de query não expressa `union all` nem window function; montar no navegador significaria baixar as duas coleções inteiras e ordenar em JavaScript | `extrato_movimentos` e as quatro que a consomem |

**Quando a leitura vira RPC, a ordenação pode virar contrato.** No extrato,
`(data, ordem_tipo, numero)` não é detalhe de exibição: mudar o desempate
muda onde a conta zerou e, portanto, muda o documento que o cliente recebe.
Por isso ela vive numa função só (`extrato_movimentos`) e as outras quatro a
consomem — duplicar o `order by` faria o corte cair num lugar na lista e
noutro no total, sem sintoma. Mesma razão de `pedidos_filtrados` existir
para o predicado.

Duas funções (lista e resumo) em vez de uma devolvendo tudo: elas têm
chaves de cache diferentes, e virar de página muda a lista mas não os
totais. Com duas, o TanStack Query serve os KPIs do cache; com uma, cada
clique em "Próxima" recalcula a agregação inteira.

O predicado mora numa terceira função compartilhada
(`pedidos_filtrados`, `pagamentos_filtrados`) — filtro atualizado numa e
esquecido na outra faz a lista mostrar 12 linhas enquanto o KPI diz 18.

**Detalhe não ganha função própria.** `getPedidoByNumero` e
`getPagamentoByNumero` chamam a função de lista com `p_numero` e
`p_limit: 1`. Um `select` próprio viraria uma segunda versão das mesmas
colunas, e é assim que o detalhe passa a mostrar número diferente do da
lista. (Tentar `returns setof listar_pagamentos` no SQL também não
funciona: `returns table (...)` é açúcar para parâmetros OUT e não cria
tipo composto nomeado.)

## Escrita

```ts
// pedidos.mutations.ts
export async function createPedido(input: CreatePedidoInput, db: Db = createClient()) {
  const { data, error } = await db.from('pedidos').insert(toRow(input)).select().single()
  if (error) throw error
  return v.parse(PedidoSchema, toPedido(data))
}
```

RPC segue o mesmo formato, validando o retorno com o schema do resultado.

Quando a permissão concede escrita sem leitura, a chamada não pede
retorno — `insert()` sem `select()`.

## Tradução de erro (Fase 7)

Quando um `SQLSTATE` específico do Postgres tem um significado de
domínio conhecido (nome duplicado, histórico impedindo exclusão,
conflito de concorrência), o service traduz antes de lançar — a tela
nunca vê código nem mensagem de constraint:

```ts
// clientes.errors.ts
if (error.code === '23505') return new NomeDuplicadoError(nomeExistente)
if (error.code === '23503') return new ClienteComHistoricoError()
if (error.code === 'PGRST116') return new ConflitoDeEdicaoError(quemEditou)
return error // código sem tradução conhecida: repassado intacto
```

Erro sem tradução conhecida é **repassado intacto**, nunca engolido —
traduzir só o que se conhece evita que um bug de rede vire "nome
duplicado" na tela por engano. O arquivo `<dom>.errors.ts` entra no
domínio quando a primeira tradução aparecer; domínio sem tradução
nenhuma não precisa do arquivo.

## Regras

- Toda resposta passa por `v.parse` antes de sair do service.
- Colunas são listadas; `select('*')` não é usado.
- Filtro, ordenação e paginação vão na query, nunca em array depois.
  Exceção registrada (Fase 11): os três filtros de leitura do extrato rodam
  no navegador, porque o conjunto inteiro já precisou vir para o total
  fechar — ver `doc/decisoes.md`. Filtrar o que já se tinha não é o modo de
  falha que a regra evita.
- Função que devolve `returns table(...)` tem **toda** coluna marcada como
  não-nula pelo gerador de tipos — ele não tem como saber. Quem sabe a
  verdade é o schema Valibot: corrija com `Omit<…> & { col: T | null }` na
  row, e deixe o `v.parse` recusar o que não deveria vir nulo. Quando as
  colunas nulas dependem de um discriminador (linha de pedido × linha de
  pagamento, no extrato), o domínio é uma **união discriminada**, não um
  objeto com tudo opcional.
- Nome de função carrega o domínio: `createPedido`, não `create`.
- O service não conhece React nem TanStack Query — devolve Promise pura.
- Erro do Supabase sem tradução de domínio é lançado, não engolido;
  quem trata é a camada de UI. Erro **com** tradução conhecida (seção
  acima) sai do service já como erro de domínio nomeado.

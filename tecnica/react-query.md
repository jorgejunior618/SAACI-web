# TanStack Query

## Chaves

Chave é hierárquica, criada por factory. Nunca escrita à mão na tela.

```ts
// pedidos.keys.ts
export const pedidosKeys = {
  all: ['pedidos'] as const,
  lists: () => [...pedidosKeys.all, 'list'] as const,
  list: (f: PedidosFiltros) => [...pedidosKeys.lists(), f] as const,
  details: () => [...pedidosKeys.all, 'detail'] as const,
  detail: (id: string) => [...pedidosKeys.details(), id] as const,
}
```

A hierarquia permite invalidar no nível certo: derrubar todas as
listagens sem tocar nos detalhes, ou derrubar o domínio inteiro.

## Definição de query

Declarada uma vez, usada no servidor e no cliente.

```ts
// pedidos.queries.ts
export const pedidosQueries = {
  list: (filtros: PedidosFiltros, db?: Db) =>
    queryOptions({
      queryKey: pedidosKeys.list(filtros),
      queryFn: () => getPedidos(filtros, db),
      staleTime: 30_000,
    }),
}
```

Duplicar `queryKey` entre prefetch e `useQuery` é a origem mais comum de
cache que não invalida — por isso a definição é única.

## Primeira carga

Molde de **toda** página que busca dado. As quatro linhas do corpo são
sempre as mesmas; só muda a query e a feature:

```tsx
// app/(dono)/pedidos/page.tsx
import { Suspense } from 'react'

import { dehydrate, HydrationBoundary } from '@tanstack/react-query'

import { createClient } from '@supabase/server'

import { pedidosQueries } from '@/services/pedidos'

import { Loading } from '@/features/pedidos/ListaPedidos/Loading'
import { ListaPedidos } from '@/features/pedidos/ListaPedidos'

import { getQueryClient } from '@/providers/query-client'

export default async function PedidosPage(): Promise<ReactNode> {
  const db = await createClient() // cliente de SERVIDOR, explícito
  const queryClient = getQueryClient()

  await queryClient.prefetchQuery(pedidosQueries.list(filtros, db))

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<Loading />}>
        <ListaPedidos />
      </Suspense>
    </HydrationBoundary>
  )
}
```

```tsx
// features/pedidos/ListaPedidos/index.tsx
'use client'
const { data } = useSuspenseQuery(pedidosQueries.list(filtros))
```

Por que cada peça existe:

| Peça                              | Papel                                                                                                                                                                                             |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `createClient()` de servidor      | Passado **explícito** para a query. Omitir cairia no padrão da assinatura, que é o cliente de navegador — e ele não enxerga o cookie no servidor: a busca voltaria vazia, sem erro nenhum.        |
| `getQueryClient()`                | O cache. No servidor, uma instância **por requisição** (`React.cache()`); no navegador, um singleton preguiçoso.                                                                                  |
| `await prefetchQuery`             | Bloqueia de propósito: é o que garante que o HTML já saia com o dado — e é justamente por causa do `await` que o `useSuspenseQuery` abaixo **não** suspende na primeira pintura.                  |
| `dehydrate` + `HydrationBoundary` | Serializa o cache em JSON e o reinjeta no navegador antes do primeiro render. Só viaja query em estado de sucesso, e `Date`/`undefined` não sobrevivem — por isso o tipo de domínio usa `string`. |
| `<Suspense>`                      | Rede de segurança, não caminho normal: com o cache hidratado ele nunca aparece. Entra quando o prefetch falha ou numa navegação client-side, e é o que dispensa estado de carregamento na tela.   |

O `fallback` é o `Loading.tsx` da própria feature, ao lado do `Empty.tsx` —
não um spinner genérico.

`getQueryClient()` mora em `src/providers/query-client/` e não dentro do
`QueryProvider`: quem mais o consome é a página, não o provider — e uma
página alcançando dentro da pasta de um componente inverteria a dependência.

A instância do servidor **nunca** é variável de módulo: em Node o módulo é
avaliado uma vez por processo e ficaria viva entre requisições de
organizações diferentes — o dado de uma fazenda apareceria para outra, sem
erro nenhum na tela. `React.cache()` memoiza por render, e uma requisição
é um render.

## `useSuspenseQuery` vs `useQuery`

> **`useSuspenseQuery`** quando a `queryKey` é estável e a página prefetcha o dado.
> **`useQuery`** quando a chave depende de input do usuário em tempo real, ou quando a query é condicional.

Não é preferência: `useSuspenseQuery` **não aceita** `enabled` nem
`placeholderData` — e essas são exatamente as ferramentas de "query que às
vezes não roda" e "query que troca de chave sem piscar". A regra é só a
consequência da API.

| Situação                                 | Hook                 | Por quê                                                                                       |
| ---------------------------------------- | -------------------- | --------------------------------------------------------------------------------------------- |
| Lista/detalhe que a página prefetcha     | `useSuspenseQuery`   | `data` nunca é `undefined`; sem `= []` mentindo que a lista está vazia                        |
| Duas ou mais queries no mesmo componente | `useSuspenseQueries` | Em sequência, cada `useSuspenseQuery` só é descoberto quando o anterior resolve — waterfall   |
| Busca, filtro ou paginação               | `useQuery`           | A chave muda a cada tecla; `keepPreviousData` (incompatível com suspense) evita o pisca-pisca |
| Query condicional (`enabled`)            | dividir o componente | Ver abaixo                                                                                    |

### O ganho concreto

`useQuery` devolve `data: undefined` quando a busca falha. Com o default
`= []` ao lado, uma falha de rede vira **lista vazia** — a tela mostra
"cadastre o primeiro produto" para quem já tem trinta. `useSuspenseQuery`
lança a falha, e o `error.tsx` a mostra como erro.

### Query condicional: dividir, não usar `enabled`

`useSuspenseQuery` não tem `enabled`. Quando o mesmo componente serve
cadastro (sem busca) e edição (com busca), a divisão é em **dois
componentes** — não é hook condicional, cada um tem a sua lista fixa de
hooks:

```tsx
export function FormularioProduto({ produtoId }: Props): ReactNode {
  return produtoId ? <ProdutoEmEdicao produtoId={produtoId} /> : <Formulario />
}

function ProdutoEmEdicao({ produtoId }: { produtoId: string }): ReactNode {
  const { data: produtos } = useSuspenseQuery(catalogoQueries.produtos())
  const produto = encontrarProduto(produtos, produtoId)

  if (!produto) notFound()

  return <Formulario produto={produto} />
}
```

O que isso apaga: o `enabled`, o `if (isEdit && !produto) return null`
(tela em branco), e um bug latente — `defaultValues` do React Hook Form é
lido **uma vez**, no primeiro render, então um formulário que montasse
antes do dado chegar nasceria vazio para sempre. Aqui o formulário só
existe num mundo onde o dado já chegou.

## ErrorBoundary

`useSuspenseQuery` lança o erro em vez de devolvê-lo em `data`. Toda tela
que usa suspense depende de um `error.tsx` acima dela — hoje um por grupo
de rota (`(dono)`, `(funcionario)`), os dois reusando
`components/ErroDeTela`. Sem isso a falha sobe até o erro genérico do Next.

## Invalidação

Escrita que altera **estado derivado** — valor pago, saldo, status —
não pode invalidar só o próprio domínio: todo domínio que lê aquele
estado fica obsoleto no mesmo instante.

Para o inventário não se espalhar pelas telas, cada domínio exporta a
sua rotina de invalidação:

```ts
// pagamentos.mutations.ts (Fase 10 — já existe)
export function invalidateAfterPagamentoWrite(qc: QueryClient): void {
  qc.invalidateQueries({ queryKey: pagamentosKeys.all })
  qc.invalidateQueries({ queryKey: pedidosKeys.all })
}
```

A tela chama a rotina; não monta a lista por conta própria. O inventário
do que um pagamento derruba precisa viver junto de quem escreve o
pagamento.

**A relação é mútua, e demorou a ficar assim.** `invalidateAfterPedidoWrite`
também derruba `pagamentosKeys.all`, porque desde a Fase 10
`atualizar_pedido` e `remover_pedido` chamam
`realocar_pagamentos_do_cliente`: corrigir o total de um pedido redistribui
o dinheiro do cliente inteiro e reescreve `valor_aplicado`, `credito` e as
alocações dos pagamentos dele. Sem isso, a lista de pagamentos continuava
exibindo "Quitou o pedido #482" e o KPI "Virou crédito" de antes da
correção — números velhos que parecem certos. A rotina de pagamentos
nasceu completa; a de pedidos só ganhou o par quando a realocação entrou.

Dois services importam a chave um do outro, e o import é **direto do
módulo** (`@/services/pagamentos/pagamentos.keys`), nunca do barrel: os
dois barrels reexportam as mutations, e as mutations importam as chaves do
outro lado — importá-las pelo barrel fecharia um ciclo. Os arquivos de
chave só dependem de um tipo do próprio domínio, então são folhas.

Um pagamento muda `valor_pago` e `status` de vários pedidos ao mesmo tempo
— e `status` é coluna gerada. Invalidar só `pagamentosKeys` deixa a lista
de pedidos mostrando "em aberto" num pedido que acabou de ser quitado.
Extrato (Fase 11), Contas a receber (Fase 12) e Relatórios (Fase 14) já
entraram. É **esta função** que cresce, e a de pedidos junto com ela — as
duas são simétricas.

**Relatórios é a invalidação mais larga das três, e a mais fácil de
justificar.** `relatoriosKeys.all` entra em `invalidateAfterPedidoWrite`,
`invalidateAfterPagamentoWrite` e `invalidateAfterDespesaWrite` porque a
tela agrega tudo: não existe recorte dela que um pedido, um pagamento ou
uma saída deixe intacto. Um pedido novo muda o faturamento, o bloco do
local, o preço médio das variações dele, a barra do dia, a linha do extrato
e — se ficou em aberto — os KPIs "A receber" e "Clientes pendentes".

Isso **não** contradiz a régua "derruba o que uma escrita torna falso, e só
isso". A régua é sobre precisão, não sobre tamanho: aqui a resposta certa é
larga porque o que a escrita torna falso é largo mesmo.

O contra-exemplo de `DetalhePedido` continua valendo para `pedidosKeys`, e
**não** se estende a `relatoriosKeys`: a corrida que obriga a invalidação
estreita ali é a query de DETALHE em que aquela tela está montada, e
nenhuma query de relatório está montada naquela rota. Mesma leitura em
`invalidateAfterDespesaRemove`, que é estreita nas chaves de despesa e
larga na de relatórios, pelo mesmo motivo.

**Despesas (Fase 13) tem a rotina mais curta, e é isso que a torna útil
como contraste.** `invalidateAfterDespesaWrite` derruba `despesasKeys.all`
e `catalogoKeys.all` — mais nada. Despesa é solta: não tem cliente, não
tem pedido, não tem alocação, e nenhuma outra tela lê coluna dela.

O catálogo entra por um motivo que não é óbvio: `listar_categorias_despesa`
e `listar_formas_pagamento` devolvem `tem_uso`, que decide o texto do
diálogo de exclusão. Lançar a primeira saída de uma categoria vira esse
booleano; remover a última o vira de volta. Sem a linha, o Catálogo aberto
noutra aba continuaria oferecendo remover uma categoria que acabou de
ganhar uso — dizendo, com todas as letras, que ela nunca foi usada.

A régua que as duas rotinas seguem é a mesma: **derruba o que uma escrita
torna falso, e só isso.** Larga onde o dado se espalha, curta onde ele não
sai do lugar.

Um contra-exemplo, para a régua não virar "invalide sempre tudo":
`DetalhePedido` invalida de propósito só `lists()` e `resumos()` ao
remover um pedido. Derrubar `pedidosKeys.all` incluiria a query de detalhe
em que a tela está montada, o refetch traria `null`, e `notFound()`
dispararia antes do `router.push` — a pessoa cairia num 404 em vez de
voltar para a lista. `DetalhePagamento` usa a rotina larga porque ali a
navegação sai da árvore e essa corrida não existe.

## staleTime

Com `staleTime: 0`, o dado hidratado pelo servidor nasce vencido e o
React Query o rebusca no primeiro mount — a tela pinta com dado e
requisita assim mesmo. Por isso os valores são constantes nomeadas em
`src/constants/cache.ts` (`STALE_TIME`), fixadas na Fase 6, não números
soltos em cada `queryOptions`:

| Natureza do dado               | Política        | `STALE_TIME`         |
| ------------------------------ | --------------- | -------------------- |
| Cadastro e lista administrável | longo           | `cadastro` — 5 min   |
| Lista operacional              | curto           | `operacional` — 30 s |
| Valor financeiro consolidado   | revalida sempre | `financeiro` — 0     |

## Paginação e filtro

Cada combinação de filtro é uma chave própria, então voltar a um filtro
já visitado não gera requisição. Na troca de página, `placeholderData`
mantém o conteúdo atual visível em vez de piscar estado de carregamento.

É por isso que lista com busca fica em `useQuery`: `placeholderData` não
existe em `useSuspenseQuery`, então a tabela inteira sumiria atrás do
fallback a cada termo digitado. `ListaClientes` é o caso — a lista usa
`useQuery` e o contador, de chave fixa, `useSuspenseQuery`. A mistura é
deliberada e está comentada no arquivo.

## Regras

- `queryFn` sempre vem do service; função de rede não é escrita na tela.
- Chave sempre da factory.
- `useSuspenseQuery` por padrão; `useQuery` só com busca, filtro ou
  paginação — e com o porquê comentado na linha.
- Query condicional divide o componente; `enabled` não entra em suspense.
- Tela com suspense exige `<Suspense fallback={<Loading />}>` na página e
  `error.tsx` no grupo de rota.
- Invalidação sempre pela rotina do domínio.
- Atualização otimista só quando a operação é reversível na UI — nunca
  em escrita financeira, que depende do retorno real da RPC.
- `QueryClient` de servidor é por requisição.

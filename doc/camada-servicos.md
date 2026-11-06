# Camada de serviços

Fronteira entre as telas e a origem do dado. Feature nunca fala com o banco nem com o mock. Hoje a
origem é um mock em memória; com o
Supabase, só esta camada muda.

Os trechos marcados com `> Alvo` descrevem o que vale quando a integração entrar.

## Arquivos de um domínio

| Arquivo              | Responsabilidade                                                     |
| -------------------- | -------------------------------------------------------------------- |
| `<dom>.types.ts`     | schema Valibot e tipo de domínio                                     |
| `<dom>.mock.ts`      | o backend fingido do domínio, em memória. Sai quando o domínio migra |
| `<dom>.api.ts`       | leitura                                                              |
| `<dom>.mutations.ts` | escrita (alvo: e RPC)                                                |
| `<dom>.keys.ts`      | chaves de cache                                                      |
| `<dom>.queries.ts`   | definições de query reaproveitáveis                                  |
| `<dom>.errors.ts`    | erro de domínio nomeado, quando o primeiro aparecer                  |
| `index.ts`           | superfície pública, sem reexportar o mock                            |

Arquivo interno nunca importa do `index.ts` do próprio domínio: o `index.ts` reexporta as mutations,
e importar por ele fecharia um ciclo.

## Tipo de domínio

O service devolve tipo de domínio em `camelCase`, inferido do schema Valibot. A row do banco, em
`snake_case`, não vaza para a feature: é isso que desacopla a tela do schema do banco.

```ts
// conta.types.ts (formato esperado: hoje `Sessao` ainda é um `type` simples)
export const SessaoSchema = v.object({
  email: v.pipe(v.string(), v.email()),
})

export type Sessao = v.InferOutput<typeof SessaoSchema>
```

```ts
// atividades.types.ts (ilustrativo: o domínio ainda não existe)
export const AtividadeSchema = v.object({
  id: v.string(),
  titulo: v.string(),
  dataAtividade: v.string(),
  horasInformadas: v.number(),
  horasComputadas: v.number(),
  categoriaId: v.string(),
})

export type Atividade = v.InferOutput<typeof AtividadeSchema>
```

Data trafega como `string`: `Date` não sobrevive ao `dehydrate` (ver `react-query.md`).

## O mock

Cada domínio tem o seu `<dom>.mock.ts`: o backend fingido, **em memória e sem persistência**.
Recarregar a página volta ao estado inicial, que **começa vazio** ou com o dado de
exemplo que o domínio declarar. O `<dom>.api.ts` e o `<dom>.mutations.ts` falam só com esse arquivo.

- O mock ordena, filtra e calcula ali dentro, não na tela.
- A leitura devolve cópia (`structuredClone`), como uma resposta de rede faria. A tela nunca recebe
  a referência do objeto que o mock guarda.
- Não existe pasta compartilhada de mock nem banco único. O que dois domínios dividirem de verdade
  vira helper em `utils/` quando o segundo domínio precisar.
- O mock simula a demora da rede, para os estados de carregamento aparecerem como vão aparecer de
  verdade, e fica instantâneo nos testes.
- Teste monta o estado chamando a função de exemplo do próprio `<dom>.mock.ts`, no `beforeEach`.
- Só o próprio domínio e os testes importam arquivo de mock. O ESLint passa a travar o resto quando o esqueleto novo existir.

Na migração, `<dom>.api.ts` e `<dom>.mutations.ts` trocam a chamada ao `<dom>.mock.ts` por
`supabase-js`, e o mock do domínio é apagado no mesmo commit.

> O código atual (`services/_mock/`, `MockPanel` e o `localStorage` `saaci:mock`) ainda guarda o
> banco inteiro no navegador. É legado e sai no reset do projeto.

## Cliente do banco

> Alvo (Supabase): ainda não implementado.

A mesma função roda no servidor (prefetch) e no cliente (refetch), e cada lado tem o seu cliente:
`createClient()` de `@supabase/client` (navegador) ou de `@supabase/server` (servidor). São dois
módulos com o mesmo nome de função, nunca importados ao mesmo tempo num arquivo. O cliente entra por
parâmetro, com o do navegador como padrão: o valor padrão só é avaliado quando o argumento é
omitido, e o Server Component sempre passa o seu.

```ts
// atividades.api.ts
import { createClient } from '@supabase/client'

export async function getAtividades(filtros: AtividadesFiltros, db: Db = createClient()) {
  let q = db
    .from('atividades')
    .select('id, titulo, data_atividade, horas_informadas, horas_computadas, categoria_id')

  if (filtros.categoriaId) q = q.eq('categoria_id', filtros.categoriaId)

  const { data, error } = await q.order('data_atividade', { ascending: false })

  if (error) throw error
  return v.parse(v.array(AtividadeSchema), data.map(toAtividade))
}
```

Server Component passa o cliente de servidor; Client Component omite. **Omitir no servidor cai no
cliente do navegador, que não enxerga o cookie de sessão: a busca volta vazia, sem erro nenhum.**

## Leitura

Sobre o mock, e toda saída passa por `v.parse`:

```ts
// conta.api.ts (formato esperado)
export function toSessao(conta: ContaMock): Sessao {
  return v.parse(SessaoSchema, { email: conta.email })
}

export async function getSessao(): Promise<Sessao | null> {
  const conta = await getContaComSessao()

  return conta ? toSessao(conta) : null
}
```

O parse não é cerimônia. É o contrato do service sendo conferido enquanto o mock existe, e o mesmo
parse acusa a row que não tem o formato esperado quando a fonte for o Supabase, antes de ela chegar
na tela.

## Quando a leitura vira RPC

> Alvo (Supabase): ainda não implementado.

O construtor de query (`.select()`) basta para lista simples. Não basta em quatro situações, e nas
quatro o domínio expõe uma função SQL em vez de encadear filtros:

| Situação                                                           | Por quê                                                                                                                                                                                                                     | Exemplo no SAACI                                           |
| ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| A tela mostra total do filtro inteiro                              | Somar o array recebido daria a soma **da página**: um número plausível, errado, que ninguém confere                                                                                                                         | Total por categoria e total geral (RF16, RF35)             |
| A linha carrega valor derivado de outra tabela ou de outras linhas | "Contou 2,5h" depende da razão da regra do curso, do semestre de início (RF38) e do máximo da categoria (RF16), que a linha do registro não tem. Montar a frase na tela com o que está à mão dá um valor plausível e errado | Horas computadas e "horas que não contam" de cada registro |
| O filtro atravessa a tabela filha                                  | `!inner` join duplica o pai quando o filho casa duas vezes: o mesmo registro aparece duas vezes e a contagem da paginação sai errada, sem sintoma. Resolve-se com `exists`                                                  | Filtrar registros por tipo de atividade da regra           |
| A tela simula antes de gravar                                      | A prévia de "curso de 8h = 2h computadas" (RF32) só é honesta se passa pela mesma função que calcula o que será gravado. Uma conta em TypeScript ao lado da conta em SQL é o segundo cálculo que RNF20 proíbe               | Prévia no formulário de registro (`calcular_horas`)        |

Quando a leitura vira RPC, a ordenação pode virar contrato. Se a ordem decide qual registro entra no
máximo da categoria, ela vive numa função só, e as outras a consomem. Duplicar o `order by` faria o
corte cair num lugar na lista e noutro no total, sem sintoma.

**Lista e resumo são duas funções**, e não uma devolvendo tudo. Elas têm chaves de cache diferentes,
e virar de página muda a lista mas não os totais. Com duas, o TanStack Query serve os totais do
cache. Com uma, cada clique em "Próxima" recalcula a agregação inteira.

**O predicado mora numa terceira função compartilhada** (`atividades_filtradas`). Filtro atualizado
numa e esquecido na outra faz a lista mostrar 12 linhas enquanto o total diz 18.

**Detalhe não ganha função própria.** `getAtividade(id)` chama a função de lista com o `id` e
`limit 1`. Um `select` próprio viraria uma segunda versão das mesmas colunas, e é assim que o detalhe
passa a mostrar número diferente do da lista.

## Escrita

Sobre o mock:

```ts
// conta.mutations.ts (formato esperado)
export async function entrar(email: string, senha: string): Promise<Sessao> {
  const conta = await openSessao(normalizar(email), senha)

  if (!conta) throw new SenhaNaoConfereError()
  return toSessao(conta)
}
```

> Alvo (Supabase): ainda não implementado.

```ts
// atividades.mutations.ts
export async function createAtividade(input: CreateAtividadeInput, db: Db = createClient()) {
  const { data, error } = await db.rpc('registrar_atividade', toParams(input))
  if (error) throw translate(error)
  return v.parse(AtividadeSchema, toAtividade(data))
}
```

RPC segue o mesmo formato, validando o retorno com o schema do resultado. O comprovante sobe antes,
para a pasta do dono, e a RPC recebe só a referência dele. Se a RPC falhar, o arquivo fica órfão e a
rotina agendada o limpa. O que o aluno preencheu continua na tela (RNF24).

## Tradução de erro

O service já lança `SenhaNaoConfereError` (`conta.errors.ts`). Ele traduz erro de domínio conhecido
antes de lançar, e a tela nunca vê código nem mensagem de constraint.

> Alvo (Supabase): ainda não implementado.

```ts
// conta.errors.ts, com o Supabase
if (error.code === 'invalid_credentials') return new SenhaNaoConfereError()
if (error.code === 'email_not_confirmed') return new EmailNaoConfirmadoError()
return error // código sem tradução conhecida: repassado intacto
```

Erro sem tradução conhecida é **repassado intacto**, nunca engolido. Traduzir só o que se conhece
evita que um bug de rede vire "a senha não confere" na tela por engano. O arquivo `<dom>.errors.ts`
entra no domínio quando a primeira tradução aparecer; domínio sem tradução nenhuma não precisa dele.

`SenhaNaoConfereError` tem a mesma mensagem para e-mail desconhecido e para senha errada. Dizer qual
dos dois errou ajudaria quem tenta descobrir e-mails de aluno.

## Regras

- Toda resposta passa por `v.parse` antes de sair do service.
- Nome de função carrega o domínio: `createAtividade`, não `create`.
- O service devolve Promise, mesmo sobre o mock.
- O service não conhece React nem TanStack Query: devolve Promise pura.
- Erro sem tradução conhecida é lançado, nunca engolido. Quem trata é a tela. Erro **com** tradução
  conhecida sai do service já como erro de domínio nomeado.
- Alvo: colunas são listadas, `select('*')` não é usado.
- Alvo: filtro, ordenação e paginação vão na query, nunca em array depois. Filtrar o que a tela já
  tinha inteiro (um filtro local sobre o conjunto que precisou vir completo para o total fechar)
  não é o modo de falha que a regra evita, mas precisa de comentário dizendo por quê.
- Alvo: função SQL com `returns table(...)` tem **toda** coluna marcada como não-nula pelo gerador de
  tipos, que não tem como saber. Quem sabe a verdade é o schema Valibot: corrija com
  `Omit<…> & { col: T | null }` na row e deixe o `v.parse` recusar o que não deveria vir nulo.
  Quando as colunas nulas dependem de um discriminador, o domínio é uma união discriminada, não um
  objeto com tudo opcional.

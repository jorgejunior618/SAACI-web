# TanStack Query

## Chaves e definição

Chave é hierárquica, criada por factory em `<dom>.keys.ts`, nunca escrita à mão na tela. A hierarquia
permite invalidar no nível certo: todas as listagens sem tocar nos detalhes, ou o domínio inteiro.

```ts
// activities.keys.ts (ilustrativo; o exemplo real é account.keys.ts)
export const activitiesKeys = {
  all: ['activities'] as const,
  lists: () => [...activitiesKeys.all, 'list'] as const,
  list: (f: ActivitiesFilters) => [...activitiesKeys.lists(), f] as const,
  detail: (id: string) => [...activitiesKeys.all, 'detail', id] as const,
}
```

A definição da query é declarada uma vez em `<dom>.queries.ts` e usada nos dois lados. Duplicar
`queryKey` entre prefetch e `useQuery` é a origem mais comum de cache que não invalida.

```ts
// account.queries.ts (existe)
export const accountQueries = {
  session: () =>
    queryOptions({
      queryKey: accountKeys.session(),
      // Função de seta: o `queryFn` recebe o contexto da query, que não pode cair no parâmetro `db`.
      queryFn: () => getSession(),
      staleTime: STALE_TIME.cadastro,
    }),
}
```

O `queryFn` vem embrulhado numa função de seta sempre que o service aceita o cliente `db` por
parâmetro. Passada direto, a função recebe o contexto da query no 1º argumento
(`camada-servicos.md`, "Função passada direto ao TanStack").

**Toda definição aceita `db?: DbClient`** e o repassa ao service: é o que deixa o prefetch do servidor
usar o cliente dele (`activitiesQueries.list(db)`). Sem o argumento, o service usa o cliente do
navegador, como as telas fazem. O `db` **não entra na chave**: ele é o cliente, não o dado, e a chave
do servidor precisa ser a mesma do navegador para o cache hidratado casar. Como a regra
`@tanstack/query/exhaustive-deps` pede o `db` na chave, cada definição leva um
`eslint-disable-next-line` com o motivo. Um teste em `tests/` confere as duas coisas.

## Primeira carga

A página busca no servidor e hidrata o cache (ADR 0020). O layout de cada grupo já busca a sessão e o
perfil com o `SessionBoundary`, e a página faz o prefetch do que a tela lê com o `PrefetchBoundary`.
Os dois ficam em `app/_prefetch/`:

```tsx
// app/(aluno)/atividades/page.tsx
async function prefetch(context: PrefetchContext): Promise<void> {
  const { db, queryClient } = context
  // O que não depende do perfil sai junto; o que depende do curso vem depois.
  const [courseId] = await Promise.all([
    prefetchCourseId(context),
    queryClient.prefetchQuery(activitiesQueries.list(db)),
    queryClient.prefetchQuery(progressQueries.summary(db)),
  ])

  if (courseId) await queryClient.prefetchQuery(rulesQueries.items(courseId, db))
}

export default function Page(): ReactNode {
  return (
    <PrefetchBoundary prefetch={prefetch}>
      <Suspense fallback={<Loading />}>
        <Atividades />
      </Suspense>
    </PrefetchBoundary>
  )
}
```

O `await` é de propósito: é ele que faz o HTML sair com o dado e o `useSuspenseQuery` não suspender na
primeira pintura. O `Suspense` é rede de segurança (prefetch que falha, navegação no cliente).

- **O `db` é sempre o do servidor** (`createServerClient`, entregue pelo `PrefetchBoundary`). Omitir o
  `db` cai no cliente do navegador, que não enxerga o cookie de sessão: a busca volta vazia, sem erro.
- **`prefetchQuery`, nunca `fetchQuery`.** Ele não lança: se a busca falhar, a tela tenta de novo no
  navegador e a falha cai no `error.tsx` do grupo.
- **Dependência do curso:** `rules.course` e `rules.items` precisam do `courseId` do perfil. O layout
  e a página renderizam em paralelo, então a página chama `prefetchCourseId`, e o React Query junta a
  busca do perfil com a do layout.
- **Página que gasta token ao ler não faz prefetch.** `/nova-senha` consome o link no Auth, e o
  servidor não grava a sessão curta que isso abre (`arquitetura.md`, exceções nomeadas).
- O `QueryClient` do servidor é **por requisição** (`React.cache()` em
  `providers/QueryProvider/query-client.ts`), nunca variável de módulo: ela viveria entre requisições
  e o dado de um aluno apareceria para outro (RNF04).

## `useSuspenseQuery` ou `useQuery`

| Situação                                 | Hook                 | Por quê                                                                     |
| ---------------------------------------- | -------------------- | --------------------------------------------------------------------------- |
| Lista ou detalhe de chave estável        | `useSuspenseQuery`   | `data` nunca é `undefined`; sem `= []` mentindo que a lista está vazia      |
| Duas ou mais queries no mesmo componente | `useSuspenseQueries` | Em sequência, cada uma só é descoberta quando a anterior resolve: waterfall |
| Busca, filtro ou paginação               | `useQuery`           | A chave muda a cada tecla; `placeholderData` evita o pisca-pisca            |
| Query condicional (`enabled`)            | dividir o componente | `useSuspenseQuery` não aceita `enabled`                                     |

**O ganho concreto.** `useQuery` devolve `data: undefined` quando a busca falha. Com `= []` ao lado,
uma falha de rede vira **lista vazia**: a tela diria "registre sua primeira atividade" para quem já
tem trinta. `useSuspenseQuery` lança a falha, e o `error.tsx` a mostra como erro.

**Query condicional: dividir, não usar `enabled`.** Quando o mesmo componente serve cadastro e edição,
são dois componentes:

```tsx
export function FormularioPerfil({ perfilId }: Props): ReactNode {
  return perfilId ? <PerfilEmEdicao perfilId={perfilId} /> : <Formulario />
}

function PerfilEmEdicao({ perfilId }: { perfilId: string }): ReactNode {
  const { data: perfil } = useSuspenseQuery(perfilQueries.detail(perfilId))

  return <Formulario perfil={perfil} />
}
```

Isso apaga o `enabled` e um bug latente: o `defaultValues` do React Hook Form é lido **uma vez**, no
primeiro render, então um formulário que montasse antes do dado chegar nasceria vazio para sempre.

**`SessionGate`** segue a mesma regra: lê a sessão com `useSuspenseQuery`, sem `enabled` nem
`isMounted`, e o perfil é o componente à parte `ProfileGate`, que só monta quando há sessão. O cache
já chega hidratado pelo layout do grupo (ADR 0020).

Toda tela com suspense depende de um `error.tsx` acima dela, um por grupo de rota, reusando
`components/ErrorScreen`.

## Invalidação

Escrita que altera **estado derivado** não pode invalidar só o próprio domínio. Registrar ou remover
uma atividade muda o progresso do painel, do resumo e do formulário (RNF20), e editar o semestre de
início do perfil também (RF11, RF38). Cada domínio exporta a sua rotina, e a tela só a chama:

```ts
// activities.mutations.ts (ilustrativo)
export function invalidateAfterAtividadeWrite(qc: QueryClient): void {
  qc.invalidateQueries({ queryKey: activitiesKeys.all })
  qc.invalidateQueries({ queryKey: progressKeys.all })
}
```

A régua: **derruba o que uma escrita torna falso, e só isso.** Larga onde o dado se espalha (o
progresso agrega tudo), curta onde ele não sai do lugar. Import de chave entre domínios é direto do
módulo (`.../atividades.keys`), nunca do barrel, que reexporta as mutations e fecharia um ciclo.

**Contra-exemplo, para a régua não virar "invalide sempre tudo".** `DetalheAtividade` invalida só
`lists()` e o progresso ao remover (RF17). Derrubar `activitiesKeys.all` incluiria a query de detalhe
em que a tela está montada: o refetch traria `null` e `notFound()` dispararia antes do
`router.push`, levando a pessoa a um 404 em vez da lista.

### Exceção: a resposta já é o novo estado

Quando a mutation devolve exatamente o dado que a query guarda, grava-se no cache em vez de invalidar:

```ts
// features/autenticacao/Login/index.tsx (existe)
onSuccess: (session) => {
  queryClient.setQueryData(accountKeys.session(), session)
  router.replace(destinoDaSessao(session))
}
```

Invalidar dispararia uma busca para saber o que `signIn` já disse. Até ela terminar, o cache ainda
diria "sem sessão", e o `SessionGate` do grupo `(aluno)` devolveria a pessoa ao login no meio do
`router.replace`. Duas condições: a chave vem da factory, e o valor gravado é o que o service
devolveu, nunca montado na tela.

## staleTime

Com `staleTime: 0`, o dado hidratado nasce vencido e é rebuscado no primeiro mount. Por isso os
valores são constantes em `src/constants/cache.ts` (`STALE_TIME`), nunca números soltos:

| Natureza do dado                 | `STALE_TIME`        |
| -------------------------------- | ------------------- |
| Regra do curso, cadastro, sessão | `cadastro`: 5 min   |
| Lista operacional                | `operacional`: 30 s |
| Horas computadas e totais        | `calculo`: 0        |

## Regras

- `queryFn` sempre vem do service; função de rede não é escrita na tela.
- Chave sempre da factory. Toda definição aceita `db` opcional, fora da chave.
- Página que lê dado usa o `PrefetchBoundary`, com `prefetchQuery` e o `db` do servidor.
- `useSuspenseQuery` por padrão; `useQuery` só com busca, filtro ou paginação, e com o porquê
  comentado na linha.
- Query condicional divide o componente.
- Tela com suspense exige `<Suspense fallback={<Loading />}>` na página e `error.tsx` no grupo de
  rota.
- Invalidação sempre pela rotina do domínio, salvo o `setQueryData` de resposta que já é o novo
  estado.
- Atualização otimista só em operação reversível. Nunca em total de horas.

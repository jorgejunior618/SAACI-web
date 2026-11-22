import type { DbClient } from '@supabase/client'
import { createServerClient } from '@supabase/server'
import { dehydrate, HydrationBoundary, noop } from '@tanstack/react-query'
import type {
  DefaultError,
  QueryClient,
  QueryExecuteOptions,
  QueryKey,
} from '@tanstack/react-query'
import type { ReactNode } from 'react'

import { getQueryClient } from '@/providers/QueryProvider/query-client'
import { profileQueries } from '@/services/profile'

/**
 * Busca uma query no servidor e a guarda no cache, sem lançar se a busca falhar.
 *
 * @remarks
 * Recebe a definição de `<dom>.queries.ts` já com o `db` do servidor. Se a busca falhar, o cache
 * segue sem o dado, a tela tenta de novo no navegador e a falha cai no `error.tsx` do grupo.
 */
export type PrefetchQuery = <
  TQueryFnData,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  options: QueryExecuteOptions<TQueryFnData, TError, TData, TQueryData, TQueryKey>,
) => Promise<void>

/** O que a função de prefetch de uma página recebe. */
export type PrefetchContext = {
  /** Cliente do Supabase do servidor, que enxerga o cookie de sessão. Passe-o a toda query. */
  db: DbClient
  /** `QueryClient` da requisição, o mesmo que o layout do grupo usa. */
  queryClient: QueryClient
  /** Busca uma query no servidor e a guarda no cache, sem lançar. */
  prefetchQuery: PrefetchQuery
}

type PrefetchBoundaryProps = {
  /** Busca no servidor o que a tela lê, com as definições de `<dom>.queries.ts` e o `db` do contexto. */
  prefetch: (context: PrefetchContext) => Promise<unknown>
  /** A tela, normalmente dentro do próprio `Suspense` com o `Loading`. */
  children: ReactNode
}

/**
 * Cria a função que busca uma query no servidor sem lançar.
 *
 * @remarks
 * Troca o `prefetchQuery` do `QueryClient`, depreciado, por `query()` com o erro engolido
 * (`.then(noop, noop)`), como o próprio TanStack Query recomenda. `query()` respeita o `staleTime`
 * da definição e junta duas buscas da mesma chave na mesma requisição.
 *
 * @param queryClient `QueryClient` da requisição.
 * @returns A função `prefetchQuery` que o prefetch das páginas usa.
 */
export function createPrefetchQuery(queryClient: QueryClient): PrefetchQuery {
  return (options) => queryClient.query(options).then(noop, noop)
}

/**
 * Busca o dado da página no servidor e o hidrata no cache antes de a tela renderizar.
 *
 * @remarks
 * O `await` é de propósito: é ele que faz o HTML sair com o dado, e o `useSuspenseQuery` da tela não
 * suspende na primeira pintura (`doc/react-query.md`). A função de prefetch usa o `prefetchQuery` do
 * contexto, que não lança: se a busca falhar, a tela tenta de novo no navegador e a falha cai no
 * `error.tsx` do grupo. O `QueryClient` é por requisição, e o dado de um aluno nunca aparece para
 * outro.
 *
 * Não use em página que gasta um token ao ler (como `/nova-senha`): o servidor consumiria o link.
 *
 * @param props A função de prefetch e a tela.
 * @returns A tela dentro do `HydrationBoundary`.
 */
export async function PrefetchBoundary({
  prefetch,
  children,
}: PrefetchBoundaryProps): Promise<ReactNode> {
  const db = await createServerClient()
  const queryClient = getQueryClient()

  await prefetch({ db, queryClient, prefetchQuery: createPrefetchQuery(queryClient) })

  return <HydrationBoundary state={dehydrate(queryClient)}>{children}</HydrationBoundary>
}

/**
 * Busca o perfil e devolve o curso dele, para o prefetch das regras que dependem do curso.
 *
 * @remarks
 * O layout do grupo também busca o perfil, e o React Query junta as duas buscas na mesma requisição.
 *
 * @param context `db`, `QueryClient` e `prefetchQuery` da página.
 * @returns O id do curso, ou `null` quando o perfil não veio ou o aluno ainda não escolheu o curso.
 */
export async function prefetchCourseId({
  db,
  queryClient,
  prefetchQuery,
}: PrefetchContext): Promise<string | null> {
  await prefetchQuery(profileQueries.detail(db))

  return queryClient.getQueryData(profileQueries.detail(db).queryKey)?.courseId ?? null
}

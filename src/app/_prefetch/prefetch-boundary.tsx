import type { DbClient } from '@supabase/client'
import { createServerClient } from '@supabase/server'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import type { QueryClient } from '@tanstack/react-query'
import type { ReactNode } from 'react'

import { getQueryClient } from '@/providers/QueryProvider/query-client'
import { profileQueries } from '@/services/profile'

/** O que a função de prefetch de uma página recebe. */
export type PrefetchContext = {
  /** Cliente do Supabase do servidor, que enxerga o cookie de sessão. Passe-o a toda query. */
  db: DbClient
  /** `QueryClient` da requisição, o mesmo que o layout do grupo usa. */
  queryClient: QueryClient
}

type PrefetchBoundaryProps = {
  /** Busca no servidor o que a tela lê, com as definições de `<dom>.queries.ts` e o `db` do contexto. */
  prefetch: (context: PrefetchContext) => Promise<unknown>
  /** A tela, normalmente dentro do próprio `Suspense` com o `Loading`. */
  children: ReactNode
}

/**
 * Busca o dado da página no servidor e o hidrata no cache antes de a tela renderizar.
 *
 * @remarks
 * O `await` é de propósito: é ele que faz o HTML sair com o dado, e o `useSuspenseQuery` da tela não
 * suspende na primeira pintura (`doc/react-query.md`). Use `prefetchQuery`, que não lança: se a busca
 * falhar, a tela tenta de novo no navegador e a falha cai no `error.tsx` do grupo. O `QueryClient` é
 * por requisição, e o dado de um aluno nunca aparece para outro.
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

  await prefetch({ db, queryClient })

  return <HydrationBoundary state={dehydrate(queryClient)}>{children}</HydrationBoundary>
}

/**
 * Busca o perfil e devolve o curso dele, para o prefetch das regras que dependem do curso.
 *
 * @remarks
 * O layout do grupo também busca o perfil, e o React Query junta as duas buscas na mesma requisição.
 *
 * @param context `db` e `QueryClient` da página.
 * @returns O id do curso, ou `null` quando o perfil não veio ou o aluno ainda não escolheu o curso.
 */
export async function prefetchCourseId({
  db,
  queryClient,
}: PrefetchContext): Promise<string | null> {
  await queryClient.prefetchQuery(profileQueries.detail(db))

  return queryClient.getQueryData(profileQueries.detail(db).queryKey)?.courseId ?? null
}

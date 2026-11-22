import { createServerClient } from '@supabase/server'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { Suspense } from 'react'
import type { ReactNode } from 'react'

import { SessionGate, SessionLoading } from '@/components/SessionGate'
import type { SessionGateMode } from '@/components/SessionGate'
import { getQueryClient } from '@/providers/QueryProvider/query-client'
import { accountQueries } from '@/services/account'
import { profileQueries } from '@/services/profile'

import { createPrefetchQuery } from './prefetch-boundary'

type SessionBoundaryProps = {
  /** Para quem o grupo de rota existe, repassado ao `SessionGate`. */
  mode: SessionGateMode
  /** Telas do grupo. */
  children: ReactNode
}

/**
 * Busca a sessão e o perfil no servidor, hidrata o cache e monta o `SessionGate` do grupo.
 *
 * @remarks
 * Usado pelo layout de cada grupo de rota. O prefetch usa o cliente do servidor, que enxerga o
 * cookie de sessão, e nunca o do navegador. O perfil só é buscado quando há sessão. Se uma busca
 * falhar, o cache segue sem ela e o `SessionGate` tenta de novo no navegador, onde a falha vai para
 * o `error.tsx` do grupo. O `Suspense` cobre esse caso e a navegação feita só no cliente.
 *
 * @param props Grupo de rota e as telas dele.
 * @returns O `SessionGate` dentro do `HydrationBoundary`.
 */
export async function SessionBoundary({
  mode,
  children,
}: SessionBoundaryProps): Promise<ReactNode> {
  const db = await createServerClient()
  const queryClient = getQueryClient()
  const prefetchQuery = createPrefetchQuery(queryClient)

  await prefetchQuery(accountQueries.session(db))

  if (queryClient.getQueryData(accountQueries.session(db).queryKey)) {
    await prefetchQuery(profileQueries.detail(db))
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<SessionLoading />}>
        <SessionGate mode={mode}>{children}</SessionGate>
      </Suspense>
    </HydrationBoundary>
  )
}

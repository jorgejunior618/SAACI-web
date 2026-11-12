'use client'

import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useEffect, useSyncExternalStore } from 'react'
import type { ReactNode } from 'react'

import { AppFrame, LoadingState } from '@design-system'

import { accountQueries } from '@/services/account'
import { profileQueries } from '@/services/profile'

import { getSessionRedirect } from './utils'

export type SessionGateMode = 'private' | 'public' | 'onboarding'

export type SessionGateProps = {
  /**
   * Para quem o grupo de rota existe. `private`: só aluno com sessão e curso escolhido. `public`:
   * só quem está sem sessão. `onboarding`: sessão confirmada, curso ainda não escolhido.
   */
  mode: SessionGateMode
  /** Telas do grupo. */
  children: ReactNode
}

function subscribeNothing(): () => void {
  return () => {}
}

/**
 * Decide se o aluno pode ver as telas de um grupo de rota e leva quem chegou ao grupo errado para o
 * lugar certo.
 *
 * @remarks
 * Lê a sessão no navegador, só depois de montar, porque o servidor não enxerga o mock (exceção do
 * `enabled` registrada em `doc/react-query.md`). O perfil só é buscado com sessão, para quem está
 * deslogado não esperar duas buscas em cascata. A regra de destino vive em `getSessionRedirect`.
 * Enquanto carrega ou redireciona, mostra um carregamento em vez das telas.
 *
 * @example
 * ```tsx
 * <SessionGate mode="private">{children}</SessionGate>
 * ```
 */
export function SessionGate({ mode, children }: SessionGateProps): ReactNode {
  const router = useRouter()
  const mounted = useSyncExternalStore(
    subscribeNothing,
    () => true,
    () => false,
  )

  // `enabled: mounted`: o servidor não enxerga o mock em memória, então a sessão só é lida no navegador.
  const session = useQuery({ ...accountQueries.session(), enabled: mounted })
  const hasSession = session.data != null
  // Sem sessão não há perfil para buscar.
  const profile = useQuery({ ...profileQueries.detail(), enabled: hasSession })

  const ready = mounted && session.isSuccess && (!hasSession || profile.isSuccess)
  const destination = ready
    ? getSessionRedirect(mode, session.data ?? null, profile.data ?? null)
    : null

  useEffect(() => {
    if (destination) router.replace(destination)
  }, [destination, router])

  if (!ready || destination) {
    return (
      <AppFrame>
        <LoadingState label="Conferindo sua sessão" />
      </AppFrame>
    )
  }

  return children
}

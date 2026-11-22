'use client'

import { useSuspenseQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import type { ReactNode } from 'react'

import { AppFrame, LoadingState } from '@design-system'

import { accountQueries } from '@/services/account'
import type { Session } from '@/services/account'
import { profileQueries } from '@/services/profile'

import { getSessionRedirect } from './utils'
import type { SessionGateMode } from './utils'

export type { SessionGateMode } from './utils'

export type SessionGateProps = {
  /**
   * Para quem o grupo de rota existe. `private`: só aluno com sessão e curso escolhido. `public`:
   * só quem está sem sessão. `onboarding`: sessão confirmada, curso ainda não escolhido. `account`:
   * qualquer pessoa com sessão, com ou sem curso (telas da conta, como Excluir conta).
   */
  mode: SessionGateMode
  /** Telas do grupo. */
  children: ReactNode
}

/**
 * Tela de carregamento da conferência de sessão.
 *
 * @remarks
 * É o fallback do `Suspense` que envolve o `SessionGate` no layout do grupo, e também o que fica
 * na tela durante um redirecionamento.
 */
export function SessionLoading(): ReactNode {
  return (
    <AppFrame>
      <LoadingState label="Conferindo sua sessão" />
    </AppFrame>
  )
}

function Redirect({ to }: { to: string }): ReactNode {
  const router = useRouter()

  useEffect(() => {
    router.replace(to)
  }, [router, to])

  return <SessionLoading />
}

type ProfileGateProps = SessionGateProps & {
  /** Sessão já lida, não nula. */
  session: Session
}

// O perfil vira componente à parte: `useSuspenseQuery` não aceita `enabled`, e sem sessão não há
// perfil para buscar (`doc/react-query.md`, "Query condicional: dividir, não usar `enabled`").
function ProfileGate({ mode, session, children }: ProfileGateProps): ReactNode {
  const { data: profile } = useSuspenseQuery(profileQueries.detail())
  const destination = getSessionRedirect(mode, session, profile)

  return destination ? <Redirect to={destination} /> : children
}

/**
 * Decide se o aluno pode ver as telas de um grupo de rota e leva quem chegou ao grupo errado para o
 * lugar certo.
 *
 * @remarks
 * Lê a sessão e o perfil que o servidor já buscou e hidratou no cache (`SessionBoundary`, em
 * `src/app/`), então a primeira pintura não espera rede. Se o cache chegar vazio (navegação no
 * cliente ou prefetch que falhou), o `useSuspenseQuery` suspende e o `Suspense` do layout mostra o
 * `SessionLoading`. Uma busca que falha lança, e o `error.tsx` do grupo mostra a tela de erro com o
 * botão de tentar de novo. O perfil só é buscado com sessão. A regra de destino vive em
 * `getSessionRedirect`.
 *
 * Precisa de um `Suspense` acima.
 *
 * @example
 * ```tsx
 * <Suspense fallback={<SessionLoading />}>
 *   <SessionGate mode="private">{children}</SessionGate>
 * </Suspense>
 * ```
 */
export function SessionGate({ mode, children }: SessionGateProps): ReactNode {
  const { data: session } = useSuspenseQuery(accountQueries.session())

  if (session) {
    return (
      <ProfileGate mode={mode} session={session}>
        {children}
      </ProfileGate>
    )
  }

  const destination = getSessionRedirect(mode, null, null)

  return destination ? <Redirect to={destination} /> : children
}

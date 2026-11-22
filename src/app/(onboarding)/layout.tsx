import type { ReactNode } from 'react'

import { SessionBoundary } from '@/app/_prefetch/session-boundary'

type Props = {
  /** Telas do grupo `(onboarding)`. */
  children: ReactNode
}

/**
 * Layout do grupo `(onboarding)`: sessão confirmada, curso ainda não escolhido.
 *
 * @remarks
 * Busca a sessão e o perfil no servidor e monta o `SessionGate` com o `SessionBoundary`. Quem já
 * escolheu o curso vai para `/inicio`.
 *
 * @returns As telas do grupo dentro do `SessionBoundary`.
 */
export default function Layout({ children }: Props): ReactNode {
  return <SessionBoundary mode="onboarding">{children}</SessionBoundary>
}

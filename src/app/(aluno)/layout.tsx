import type { ReactNode } from 'react'

import { SessionBoundary } from '@/app/_prefetch/session-boundary'

type Props = {
  /** Telas do grupo `(aluno)`. */
  children: ReactNode
}

/**
 * Layout do grupo `(aluno)`: só aluno com sessão e curso escolhido.
 *
 * @remarks
 * Busca a sessão e o perfil no servidor e monta o `SessionGate` com o `SessionBoundary`. Quem chega
 * sem sessão já foi redirecionado para `/entrar` pelo `proxy.ts`; quem tem sessão e não escolheu o
 * curso vai para `/seu-curso`.
 *
 * @returns As telas do grupo dentro do `SessionBoundary`.
 */
export default function Layout({ children }: Props): ReactNode {
  return <SessionBoundary mode="private">{children}</SessionBoundary>
}

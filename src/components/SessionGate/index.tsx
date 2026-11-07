import type { ReactNode } from 'react'

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

/**
 * Decide se o aluno pode ver as telas de um grupo de rota.
 *
 * @remarks
 * Hoje é um stub: deixa todo mundo passar e ignora `mode`, para as telas poderem ser feitas antes do
 * login. A issue de Acesso troca o corpo para ler a sessão no navegador e levar quem chegou ao grupo
 * errado para o lugar certo. As telas e os layouts não mudam, porque o contrato (`mode` e `children`)
 * já é o definitivo.
 *
 * @example
 * ```tsx
 * <SessionGate mode="private">{children}</SessionGate>
 * ```
 */
export function SessionGate({ children }: SessionGateProps): ReactNode {
  return children
}

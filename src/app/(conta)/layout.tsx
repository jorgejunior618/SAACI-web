// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import type { ReactNode } from 'react'

import { SessionBoundary } from '@/app/_prefetch/session-boundary'

type Props = {
  /** Telas do grupo `(conta)`. */
  children: ReactNode
}

/**
 * Layout do grupo `(conta)`: qualquer pessoa com sessão, com ou sem curso.
 *
 * @remarks
 * Busca a sessão e o perfil no servidor e monta o `SessionGate` com o `SessionBoundary`. Hoje reúne
 * Excluir conta, que vale antes e depois de escolher o curso.
 *
 * @returns As telas do grupo dentro do `SessionBoundary`.
 */
export default function Layout({ children }: Props): ReactNode {
  return <SessionBoundary mode="account">{children}</SessionBoundary>
}

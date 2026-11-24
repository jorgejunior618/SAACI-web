// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import type { ReactNode } from 'react'

import { SessionBoundary } from '@/app/_prefetch/session-boundary'

type Props = {
  /** Telas do grupo `(publico)`. */
  children: ReactNode
}

/**
 * Layout do grupo `(publico)`: só quem está sem sessão.
 *
 * @remarks
 * Busca a sessão no servidor e monta o `SessionGate` com o `SessionBoundary`. Quem tem sessão vai
 * para `/inicio` ou, sem curso, para `/seu-curso`. O `proxy.ts` não barra este grupo, porque
 * `/nova-senha` usa a sessão curta aberta pelo link.
 *
 * @returns As telas do grupo dentro do `SessionBoundary`.
 */
export default function Layout({ children }: Props): ReactNode {
  return <SessionBoundary mode="public">{children}</SessionBoundary>
}

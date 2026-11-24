// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import type { ReactNode } from 'react'

import { ExpiredLink } from '@/features/acesso/_components/ExpiredLink'

/** Nova senha sem link que valha: sem token, vencido, já usado ou desconhecido. */
export function Empty(): ReactNode {
  return <ExpiredLink />
}

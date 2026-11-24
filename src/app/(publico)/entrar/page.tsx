// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import { Entrar } from '@/features/acesso/Entrar'

export const metadata: Metadata = { title: 'Entrar' }

export default function Page(): ReactNode {
  return <Entrar />
}

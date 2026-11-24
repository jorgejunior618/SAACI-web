// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import { RecuperarSenha } from '@/features/acesso/RecuperarSenha'

export const metadata: Metadata = { title: 'Recuperar senha' }

export default function Page(): ReactNode {
  return <RecuperarSenha />
}

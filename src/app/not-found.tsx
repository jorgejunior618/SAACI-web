// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import { NotFoundScreen } from '@/components/NotFoundScreen'

export const metadata: Metadata = { title: 'Página não encontrada' }

export default function NotFound(): ReactNode {
  return (
    <NotFoundScreen
      title="Esta página não existe"
      description="O endereço pode ter mudado ou estar digitado errado. Volte para o início e continue de lá."
      backHref="/"
      backLabel="Ir para o início"
    />
  )
}

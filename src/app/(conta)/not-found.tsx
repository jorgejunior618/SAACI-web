// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import type { ReactNode } from 'react'

import { NotFoundScreen } from '@/components/NotFoundScreen'

export default function NotFound(): ReactNode {
  return (
    <NotFoundScreen
      title="Esta página não existe"
      description="O endereço pode ter mudado ou estar digitado errado. Volte e continue de lá."
      backHref="/entrar"
      backLabel="Ir para Entrar"
    />
  )
}

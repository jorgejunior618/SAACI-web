// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import type { ReactNode } from 'react'

import { AppFrame, LoadingState } from '@design-system'

/** Carregamento da tela Seu curso, enquanto a lista de cursos com regras chega. */
export function Loading(): ReactNode {
  return (
    <AppFrame>
      <LoadingState label="Buscando os cursos" />
    </AppFrame>
  )
}

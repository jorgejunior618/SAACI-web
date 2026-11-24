// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import type { ReactNode } from 'react'

import { AppFrame, LoadingState } from '@design-system'

/** Carregamento da tela Nova senha, enquanto o link é conferido. */
export function Loading(): ReactNode {
  return (
    <AppFrame>
      <LoadingState label="Conferindo o link" />
    </AppFrame>
  )
}

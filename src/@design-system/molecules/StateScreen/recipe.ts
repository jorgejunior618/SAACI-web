// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import { cva } from '@/styled-system/css'

// Círculo de 56px em `surface` com borda de 1px em `line`, que guarda o ícone de 28px. 56px é a
// medida do desenho: `sizes` não tem escala numérica.
const circle = {
  display: 'grid',
  placeItems: 'center',
  width: '56px',
  height: '56px',
  borderRadius: 'full',
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: 'line',
  background: 'surface',
} as const

export const stateArt = cva({
  base: {
    display: 'flex',
    marginBlockEnd: '4',
  },
  variants: {
    variant: {
      empty: { ...circle, color: 'brand.text' },
      success: { ...circle, color: 'brand.text' },
      connectionError: { ...circle, color: 'danger' },
      // O spinner grande aparece direto sobre a tela, sem círculo.
      loading: {},
    },
  },
})

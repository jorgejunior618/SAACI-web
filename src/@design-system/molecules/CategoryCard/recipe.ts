// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import { cva } from '@/styled-system/css'

// Completo é bom: o número e o rodapé passam para o verde de texto da marca, sem ícone nem badge.
export const categoryCount = cva({
  base: { textStyle: 'title', color: 'ink', fontVariantNumeric: 'tabular-nums' },
  variants: {
    full: {
      true: { color: 'brand.text' },
    },
  },
})

export const categoryFoot = cva({
  base: {
    display: 'block',
    margin: '0',
    marginBlockStart: '2',
    textStyle: 'support',
    color: 'ink.muted',
  },
  variants: {
    full: {
      true: { color: 'brand.text' },
    },
  },
})

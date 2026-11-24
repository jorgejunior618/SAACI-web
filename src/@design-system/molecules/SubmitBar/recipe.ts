// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import { cva } from '@/styled-system/css'

// O número fica em `warning` quando a atividade vai contar menos do que vale (parcial ou não conta).
export const summaryValue = cva({
  base: {
    textStyle: 'title',
    fontVariantNumeric: 'tabular-nums',
  },
  variants: {
    tone: {
      neutral: { color: 'ink' },
      warning: { color: 'warning' },
    },
  },
  defaultVariants: { tone: 'neutral' },
})

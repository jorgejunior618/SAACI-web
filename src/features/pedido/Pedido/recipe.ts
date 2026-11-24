// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import { cva } from '@/styled-system/css'

// O título fica verde só quando o formulário está pronto: a cor é o aviso de que dá para baixar.
export const headline = cva({
  base: { margin: '0', textStyle: 'display' },
  variants: {
    tone: {
      ready: { color: 'brand.text' },
      pending: { color: 'ink' },
    },
  },
  defaultVariants: { tone: 'pending' },
})

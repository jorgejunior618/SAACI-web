// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import { cva } from '@/styled-system/css'

// 16px, 32px e as espessuras são medidas do componente: `sizes` não tem escala numérica.
export const spinner = cva({
  base: {
    flex: 'none',
    borderRadius: 'full',
    borderStyle: 'solid',
    borderRightColor: 'transparent',
    animationName: 'spin',
    animationDuration: '1.2s',
    animationTimingFunction: 'linear',
    animationIterationCount: 'infinite',
  },
  variants: {
    size: {
      // Herda a cor do texto ao redor (por exemplo, o `brand.on` do botão primário).
      sm: { width: '16px', height: '16px', borderWidth: '2px' },
      // Indicador grande: cinza do redemoinho com a ponta em `brand`.
      lg: {
        width: '32px',
        height: '32px',
        borderWidth: '2.5px',
        color: 'redemoinho',
        borderTopColor: 'brand',
      },
    },
  },
  defaultVariants: { size: 'sm' },
})

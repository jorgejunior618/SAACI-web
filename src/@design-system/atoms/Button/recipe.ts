// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import { cva } from '@/styled-system/css'

export const button = cva({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '2',
    minHeight: 'control',
    paddingInline: '4',
    textStyle: 'bodyStrong',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'transparent',
    borderRadius: 'control',
    cursor: 'pointer',
    textDecoration: 'none',
    WebkitTapHighlightColor: 'transparent',
    // `disabled` é para ação impossível (sem conexão). Vale sobre qualquer variante.
    _disabled: {
      background: 'line',
      color: 'ink.muted',
      borderColor: 'transparent',
      cursor: 'not-allowed',
    },
    '&[aria-busy="true"]': { cursor: 'progress' },
  },
  variants: {
    variant: {
      primary: {
        background: 'brand',
        color: 'brand.on',
        '&:active:not(:disabled)': { background: 'brand.pressed' },
      },
      secondary: {
        background: 'surface',
        color: 'ink',
        borderColor: 'line',
        '&:active:not(:disabled)': { background: 'surface.muted' },
      },
      tertiary: {
        background: 'transparent',
        color: 'brand.text',
        paddingInline: '2',
      },
      // Só em bottom sheet e tela de confirmação.
      danger: {
        background: 'danger.fill',
        color: 'danger.on',
      },
    },
    // Só largura: não toca nas propriedades de `variant`, então não precisa de compoundVariants.
    block: {
      true: { display: 'flex', width: '100%' },
    },
  },
  defaultVariants: { variant: 'primary' },
})

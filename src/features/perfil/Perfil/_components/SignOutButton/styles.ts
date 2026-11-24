// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import { styled } from '@/styled-system/jsx'

export const Root = styled('div', {
  base: { display: 'flex', flexDirection: 'column', gap: '2' },
})

// Mesmo cartão de uma linha do Apagar minha conta, logo abaixo, com o texto na cor normal.
export const Action = styled('button', {
  base: {
    display: 'flex',
    alignItems: 'center',
    minHeight: 'touch',
    width: '100%',
    paddingInline: '4',
    textStyle: 'body',
    color: 'ink',
    textAlign: 'start',
    background: 'surface',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'line',
    borderRadius: 'card',
    cursor: 'pointer',
    _focusVisible: { outline: '2px solid token(colors.focus)', outlineOffset: '2px' },
  },
})

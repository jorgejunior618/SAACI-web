// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import { styled } from '@/styled-system/jsx'

// Separado do resto por uma divisória: é a única ação que não tem volta.
export const Root = styled('section', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2',
    paddingBlockStart: '6',
    borderBlockStartWidth: '1px',
    borderBlockStartStyle: 'solid',
    borderBlockStartColor: 'line',
  },
})

export const Action = styled('a', {
  base: {
    display: 'flex',
    alignItems: 'center',
    minHeight: 'touch',
    paddingInline: '4',
    textStyle: 'bodyStrong',
    color: 'danger',
    textDecoration: 'none',
    background: 'surface',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'line',
    borderRadius: 'card',
  },
})

export const Help = styled('p', {
  base: { margin: '0', paddingInline: '1', textStyle: 'support', color: 'ink.muted' },
})

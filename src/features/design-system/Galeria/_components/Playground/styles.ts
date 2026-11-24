// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import { styled } from '@/styled-system/jsx'

export const Root = styled('section', {
  base: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr)',
    gap: '4',
    '@media (min-width: 768px)': { gridTemplateColumns: 'minmax(0, 1fr) 16rem' },
  },
})

export const Stage = styled('div', {
  base: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '3',
    minHeight: '12rem',
    padding: '6',
    background: 'surface',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'line',
    borderRadius: 'card',
  },
})

export const Panel = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4',
    padding: '4',
    background: 'surface',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'line',
    borderRadius: 'card',
  },
})

export const PanelTitle = styled('h3', {
  base: { textStyle: 'label', color: 'ink.muted' },
})

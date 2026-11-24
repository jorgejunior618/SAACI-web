// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import { styled } from '@/styled-system/jsx'

export const Root = styled('div', {
  base: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr)',
    minHeight: '100vh',
    '@media (min-width: 768px)': {
      // Sidebar de 15rem; a galeria é página de desktop, o app em si é que é só mobile.
      gridTemplateColumns: '15rem minmax(0, 1fr)',
    },
  },
})

export const Content = styled('main', {
  base: {
    width: '100%',
    maxWidth: '64rem',
    paddingBlock: '8',
    paddingInline: '4',
    '@media (min-width: 768px)': { paddingInline: '8' },
  },
})

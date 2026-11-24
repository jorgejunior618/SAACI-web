// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import { styled } from '@/styled-system/jsx'

export const Root = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    maxWidth: 'content',
    minHeight: '100dvh',
    marginInline: 'auto',
    background: 'surface.sunken',
    // viewportFit: 'cover' deixa o conteúdo sob o entalhe lateral em paisagem.
    paddingLeft: 'env(safe-area-inset-left)',
    paddingRight: 'env(safe-area-inset-right)',
  },
})

export const Top = styled('div', {
  base: { position: 'sticky', top: '0', zIndex: 1 },
})

export const Main = styled('main', {
  base: { flex: '1', minWidth: '0' },
})

export const Bottom = styled('div', {
  base: { position: 'sticky', bottom: '0', zIndex: 1 },
})

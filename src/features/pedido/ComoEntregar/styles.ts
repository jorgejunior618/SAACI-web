// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import { styled } from '@/styled-system/jsx'

export const Page = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6',
    paddingInline: '4',
    paddingBlockStart: '1',
    paddingBlockEnd: '6',
  },
})

export const Header = styled('div', {
  base: { display: 'flex', flexDirection: 'column', gap: '1' },
})

export const Headline = styled('h2', {
  base: { margin: '0', textStyle: 'title', color: 'ink' },
})

export const Lead = styled('p', {
  base: { margin: '0', textStyle: 'support', color: 'ink.muted' },
})

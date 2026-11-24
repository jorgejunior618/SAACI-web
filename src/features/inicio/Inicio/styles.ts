// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import { styled } from '@/styled-system/jsx'

export const Page = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6',
    paddingInline: '4',
    paddingBlock: '4',
  },
})

export const Section = styled('section', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3',
  },
})

export const SectionTitle = styled('h2', {
  base: {
    textStyle: 'title',
    color: 'ink',
  },
})

export const CardList = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3',
  },
})

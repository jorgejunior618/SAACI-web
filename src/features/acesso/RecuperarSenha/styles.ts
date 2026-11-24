// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import { styled } from '@/styled-system/jsx'

export const Page = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6',
    minHeight: '100dvh',
    paddingInline: '6',
    paddingBlock: '6',
  },
})

export const Heading = styled('div', {
  base: { display: 'flex', flexDirection: 'column', gap: '2' },
})

export const Title = styled('h1', {
  base: { margin: '0', textStyle: 'title' },
})

export const Intro = styled('p', {
  base: { margin: '0', textStyle: 'body', color: 'ink.muted' },
})

export const Form = styled('form', {
  base: { display: 'flex', flexDirection: 'column', gap: '6' },
})

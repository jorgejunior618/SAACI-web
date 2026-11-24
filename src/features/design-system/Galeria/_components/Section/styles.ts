// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import { styled } from '@/styled-system/jsx'

export const Root = styled('article', {
  base: { display: 'flex', flexDirection: 'column', gap: '8' },
})

export const Header = styled('header', {
  base: { display: 'flex', flexDirection: 'column', gap: '2' },
})

export const Title = styled('h1', {
  base: { textStyle: 'display' },
})

export const Description = styled('p', {
  base: { textStyle: 'body', color: 'ink.muted', maxWidth: '40rem' },
})

export const Body = styled('div', {
  base: { display: 'flex', flexDirection: 'column', gap: '8' },
})

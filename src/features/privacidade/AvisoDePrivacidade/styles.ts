// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import { styled } from '@/styled-system/jsx'

export const Page = styled('div', {
  base: { display: 'flex', flexDirection: 'column', gap: '4', padding: '4' },
})

export const Title = styled('h2', {
  base: { margin: '0', textStyle: 'title', color: 'ink' },
})

export const Section = styled('section', {
  base: { display: 'flex', flexDirection: 'column', gap: '2' },
})

export const Heading = styled('h3', {
  base: { margin: '0', textStyle: 'label', color: 'ink' },
})

export const Text = styled('p', {
  base: { margin: '0', textStyle: 'body', color: 'ink' },
})

export const List = styled('ul', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2',
    margin: '0',
    paddingInlineStart: '4',
    textStyle: 'body',
    color: 'ink',
  },
})

export const TextLink = styled('a', {
  base: { color: 'ink', textDecoration: 'underline' },
})

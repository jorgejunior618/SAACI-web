// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import { styled } from '@/styled-system/jsx'

import { marker } from './recipe'

export const Root = styled('section', {
  base: { display: 'flex', flexDirection: 'column', gap: '4' },
})

export const Title = styled('h2', {
  base: { margin: '0', textStyle: 'title', color: 'ink' },
})

export const List = styled('ol', {
  base: { margin: '0', padding: '0', listStyle: 'none' },
})

export const Step = styled('li', {
  base: {
    display: 'grid',
    gridTemplateColumns: '32px 1fr',
    columnGap: '4',
    paddingBlockEnd: '4',
    _last: { paddingBlockEnd: '0' },
  },
})

export const Rail = styled('div', {
  base: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
})

export const Marker = styled('span', marker)

// Liga um marcador ao seguinte e cresce com a altura do passo.
export const Line = styled('span', {
  base: {
    flex: '1',
    width: '2px',
    marginBlock: '1',
    background: 'line',
  },
})

export const Text = styled('div', {
  base: { display: 'flex', flexDirection: 'column', gap: '1', paddingBlockStart: '1' },
})

export const Eyebrow = styled('p', {
  base: { margin: '0', textStyle: 'caption', color: 'brand.text' },
})

export const StepTitle = styled('h3', {
  base: { margin: '0', textStyle: 'bodyStrong', color: 'ink' },
})

export const StepText = styled('p', {
  base: { margin: '0', textStyle: 'body', color: 'ink.muted' },
})

export const Action = styled('div', {
  base: { marginBlockStart: '3' },
})

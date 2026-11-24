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

export const Header = styled('header', {
  base: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2' },
})

export const Name = styled('h2', {
  base: { margin: '0', textStyle: 'title', color: 'ink' },
})

export const ItemName = styled('p', {
  base: { margin: '0', textStyle: 'support', color: 'ink.muted' },
})

export const Section = styled('section', {
  base: { display: 'flex', flexDirection: 'column', gap: '3' },
})

export const SectionTitle = styled('h3', {
  base: { margin: '0', textStyle: 'label', color: 'ink' },
})

// Lista de rótulo e valor, separados por linha fina, como no cartão de dados do protótipo.
export const Data = styled('dl', {
  base: { margin: '0', display: 'flex', flexDirection: 'column' },
})

export const DataRow = styled('div', {
  base: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    gap: '3',
    paddingBlock: '3',
    '&:not(:first-child)': {
      borderBlockStartWidth: '1px',
      borderBlockStartStyle: 'solid',
      borderBlockStartColor: 'line',
    },
    _first: { paddingBlockStart: '0' },
    _last: { paddingBlockEnd: '0' },
  },
})

export const DataLabel = styled('dt', {
  base: { textStyle: 'body', color: 'ink.muted' },
})

export const DataValue = styled('dd', {
  base: { margin: '0', textStyle: 'body', color: 'ink', fontVariantNumeric: 'tabular-nums' },
})

export const Actions = styled('div', {
  base: { display: 'flex', flexDirection: 'column', gap: '3' },
})

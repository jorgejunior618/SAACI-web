// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import { styled } from '@/styled-system/jsx'

export const Root = styled('details', {
  base: {
    background: 'surface',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'line',
    borderRadius: 'card',
    // A seta gira quando a seção abre. Com `prefers-reduced-motion` a regra global zera a
    // transição e a seta só pula para o estado final, que continua legível.
    '&[open] > summary [data-arrow]': { transform: 'rotate(180deg)' },
  },
})

export const Summary = styled('summary', {
  base: {
    display: 'flex',
    alignItems: 'center',
    gap: '2',
    minHeight: 'touch',
    paddingBlock: '3',
    paddingInline: '4',
    cursor: 'pointer',
    listStyle: 'none',
    '&::-webkit-details-marker': { display: 'none' },
  },
})

// `minWidth: 0` deixa o título encolher e ganhar reticências em vez de empurrar o texto da direita.
export const Heading = styled('span', {
  base: { display: 'flex', flexDirection: 'column', minWidth: '0' },
})

export const Eyebrow = styled('span', {
  base: { textStyle: 'caption', color: 'ink.muted' },
})

export const Title = styled('span', {
  base: {
    textStyle: 'bodyStrong',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
})

export const Count = styled('span', {
  base: {
    textStyle: 'body',
    color: 'ink.muted',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
})

// Empurra o texto da direita e a seta para a borda, com ou sem `aside`.
export const End = styled('span', {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '3',
    flexShrink: '0',
    marginInlineStart: 'auto',
  },
})

export const Arrow = styled('span', {
  base: {
    display: 'inline-flex',
    color: 'ink.subtle',
    transitionProperty: 'transform',
    transitionDuration: 'fast',
    transitionTimingFunction: 'out',
  },
})

export const Body = styled('ul', {
  base: { listStyle: 'none', margin: '0', padding: '0', paddingBlockEnd: '2' },
})

export const Row = styled('li', {
  base: {
    position: 'relative',
    display: 'grid',
    // Coluna do número do item: 20px, alinhada à direita.
    gridTemplateColumns: '20px 1fr',
    columnGap: '3',
    paddingBlock: '3',
    paddingInline: '4',
    // Divisória com recuo: começa no nome (16 de respiro + 20 da coluna + 12 de vão).
    '&:not(:first-child)::before': {
      content: '""',
      position: 'absolute',
      top: '0',
      insetInlineStart: '48px',
      insetInlineEnd: '0',
      borderBlockStartWidth: '1px',
      borderBlockStartStyle: 'solid',
      borderBlockStartColor: 'line',
    },
  },
})

export const ItemNumber = styled('span', {
  base: {
    textStyle: 'support',
    // Mesma altura da linha do nome, para os dois alinharem.
    lineHeight: '24px',
    color: 'ink.muted',
    fontVariantNumeric: 'tabular-nums',
    textAlign: 'right',
  },
})

export const Name = styled('span', {
  base: { textStyle: 'body' },
})

export const Rule = styled('span', {
  base: { display: 'block', marginBlockStart: '1', textStyle: 'support', color: 'ink.muted' },
})

import { styled } from '@/styled-system/jsx'

import { categoryCount, categoryFoot } from './recipe'

export const Head = styled('span', {
  base: { display: 'flex', alignItems: 'center', gap: '2' },
})

export const Titles = styled('span', {
  base: { flex: '1', minWidth: '0' },
})

export const ItemNumber = styled('span', {
  base: {
    display: 'block',
    textStyle: 'caption',
    color: 'ink.muted',
    fontVariantNumeric: 'tabular-nums',
  },
})

export const Name = styled('span', {
  base: {
    display: '-webkit-box',
    overflow: 'hidden',
    textStyle: 'bodyStrong',
    // Até duas linhas; o resto some com reticências.
    WebkitLineClamp: '2',
    WebkitBoxOrient: 'vertical',
  },
})

// A seta é ícone solto à direita: o link inteiro já tem nome, então ela não leva texto.
export const Arrow = styled('span', {
  base: { display: 'inline-flex', flex: 'none', color: 'ink.subtle' },
})

export const Hours = styled('span', {
  base: { display: 'flex', alignItems: 'baseline', gap: '1', marginBlockStart: '3' },
})

export const Count = styled('span', categoryCount)

export const Max = styled('span', {
  base: { textStyle: 'support', color: 'ink.muted', fontVariantNumeric: 'tabular-nums' },
})

export const BarWrap = styled('span', {
  base: { display: 'block', marginBlockStart: '2' },
})

export const Foot = styled('span', categoryFoot)

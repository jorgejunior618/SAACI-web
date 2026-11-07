import { styled } from '@/styled-system/jsx'

// Linha de status sem caixa: o spinner e a frase, na cor de apoio.
export const Status = styled('div', {
  base: {
    display: 'flex',
    alignItems: 'center',
    gap: '2',
    textStyle: 'support',
    color: 'ink.muted',
  },
})

export const Question = styled('p', {
  base: { margin: '0', textStyle: 'support', color: 'ink.muted' },
})

export const Item = styled('div', {
  base: { display: 'flex', flexDirection: 'column', marginBlockStart: '3' },
})

export const ItemNumber = styled('span', {
  base: { textStyle: 'caption', color: 'ink.muted', fontVariantNumeric: 'tabular-nums' },
})

export const ItemName = styled('span', {
  base: { marginBlockStart: '1', textStyle: 'bodyStrong', color: 'ink' },
})

export const ItemRule = styled('span', {
  base: { textStyle: 'support', color: 'ink.muted' },
})

export const Actions = styled('div', {
  base: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2', marginBlockStart: '4' },
})

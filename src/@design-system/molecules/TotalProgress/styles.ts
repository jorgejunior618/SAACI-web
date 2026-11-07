import { styled } from '@/styled-system/jsx'

import { totalNumber } from './recipe'

export const Total = styled('span', totalNumber)

export const Label = styled('p', {
  base: { margin: '0', marginBlockStart: '1', textStyle: 'support', color: 'ink.muted' },
})

export const BarWrap = styled('div', {
  base: { marginBlockStart: '4' },
})

export const Meta = styled('div', {
  base: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBlockStart: '2',
    textStyle: 'support',
    color: 'ink.muted',
    fontVariantNumeric: 'tabular-nums',
  },
})

// Frase do excedente no estado completo: mais ar que o rótulo, para separar do número.
export const Surplus = styled('p', {
  base: { margin: '0', marginBlockStart: '3', textStyle: 'support', color: 'ink.muted' },
})

export const GuideWrap = styled('div', {
  base: { marginBlockStart: '4' },
})

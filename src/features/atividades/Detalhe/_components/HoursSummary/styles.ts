import { styled } from '@/styled-system/jsx'

import { hoursNumber } from './recipe'

export const Hours = styled('p', {
  base: { display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', columnGap: '2', margin: '0' },
})

export const HoursNumber = styled('span', hoursNumber)

export const HoursLabel = styled('span', {
  base: { textStyle: 'body', color: 'ink.muted' },
})

export const Why = styled('p', {
  base: { margin: '0', marginBlockStart: '2', textStyle: 'body', color: 'ink' },
})

export const Table = styled('table', {
  base: {
    width: '100%',
    borderCollapse: 'collapse',
    marginBlockStart: '4',
    textStyle: 'support',
    fontVariantNumeric: 'tabular-nums',
  },
})

export const Caption = styled('caption', {
  base: { textAlign: 'start', fontWeight: '500', color: 'ink', paddingBlockEnd: '2' },
})

export const Label = styled('th', {
  base: { textAlign: 'start', fontWeight: '400', color: 'ink.muted', paddingBlock: '1' },
})

export const Value = styled('td', {
  base: { textAlign: 'end', paddingBlock: '1', whiteSpace: 'nowrap', color: 'ink' },
})

// A última linha é a resposta da tabela: borda fina em cima e peso 600.
const totalCell = {
  textStyle: 'body',
  fontWeight: '600',
  color: 'ink',
  paddingBlockStart: '2',
  borderBlockStartWidth: '1px',
  borderBlockStartStyle: 'solid',
  borderBlockStartColor: 'line',
} as const

export const TotalLabel = styled('th', { base: { ...totalCell, textAlign: 'start' } })

export const TotalValue = styled('td', {
  base: { ...totalCell, textAlign: 'end', whiteSpace: 'nowrap' },
})

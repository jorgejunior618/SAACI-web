import { styled } from '@/styled-system/jsx'

import { summaryValue } from './recipe'

export const Root = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2',
    paddingInline: '4',
    paddingBlockStart: '3',
    paddingBlockEnd: 'calc(token(spacing.4) + env(safe-area-inset-bottom))',
    background: 'surface',
    borderTopWidth: '1px',
    borderTopStyle: 'solid',
    borderTopColor: 'line',
  },
})

export const Summary = styled('div', {
  base: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: '3',
  },
})

export const SummaryLabel = styled('span', {
  base: { textStyle: 'support', color: 'ink.muted' },
})

export const SummaryValue = styled('b', summaryValue)

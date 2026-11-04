import { styled } from '@/styled-system/jsx'

export const Top = styled('div', {
  base: { display: 'flex', alignItems: 'baseline', gap: '2', flexWrap: 'wrap' },
})

export const Total = styled('span', {
  base: { textStyle: 'display' },
})

export const TotalLabel = styled('span', {
  base: { textStyle: 'support', color: 'ink.muted' },
})

export const Summary = styled('p', {
  base: { margin: '1 0 0', textStyle: 'support', color: 'ink.muted' },
})

export const Body = styled('div', {
  base: { display: 'flex', flexDirection: 'column', gap: '3', marginTop: '4' },
})

export const Support = styled('p', {
  base: {
    margin: '0',
    textStyle: 'support',
    color: 'ink.muted',
    fontVariantNumeric: 'tabular-nums',
  },
})

export const Links = styled('div', {
  base: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '4',
    paddingTop: '2',
    marginX: '-2',
    borderTopWidth: '1px',
    borderTopStyle: 'solid',
    borderTopColor: 'line',
  },
})

import { styled } from '@/styled-system/jsx'

export const Root = styled('section', {
  base: { display: 'flex', flexDirection: 'column', gap: '2' },
})

export const Title = styled('h2', {
  base: { margin: '0', textStyle: 'support', color: 'ink.muted' },
})

export const List = styled('div', {
  base: {
    background: 'surface',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'line',
    borderRadius: 'card',
    overflow: 'hidden',
  },
})

const row = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '3',
  minHeight: 'touch',
  width: '100%',
  paddingInline: '4',
  textStyle: 'body',
  color: 'ink',
  textDecoration: 'none',
  background: 'transparent',
  border: 'none',
  textAlign: 'start',
  cursor: 'pointer',
  // Divisória de cima em toda linha, menos na primeira.
  '&:not(:first-child)': {
    borderBlockStartWidth: '1px',
    borderBlockStartStyle: 'solid',
    borderBlockStartColor: 'line',
  },
} as const

export const RowLink = styled('a', { base: row })

export const RowButton = styled('button', { base: row })

export const Chevron = styled('span', {
  base: { display: 'flex', color: 'ink.subtle' },
})

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

export const Section = styled('section', {
  base: { display: 'flex', flexDirection: 'column', gap: '3' },
})

export const SectionTitle = styled('h2', {
  base: { margin: '0', textStyle: 'body', color: 'ink' },
})

// Um cartão só para as duas saídas: o `Card` tem 16px de respiro, e a divisória precisa ir de ponta
// a ponta. Mesma borda e mesmo raio dele.
export const Paths = styled('div', {
  base: {
    background: 'surface',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'line',
    borderRadius: 'card',
    overflow: 'hidden',
  },
})

export const Path = styled('a', {
  base: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '3',
    minHeight: 'touch',
    padding: '4',
    color: 'ink',
    textDecoration: 'none',
    '&:not(:first-child)': {
      borderBlockStartWidth: '1px',
      borderBlockStartStyle: 'solid',
      borderBlockStartColor: 'line',
    },
  },
})

export const PathText = styled('span', {
  base: { display: 'flex', flexDirection: 'column', gap: '1', minWidth: '0' },
})

export const PathTitle = styled('span', {
  base: { textStyle: 'bodyStrong', color: 'ink' },
})

export const PathDetail = styled('span', {
  base: { textStyle: 'support', color: 'ink.muted' },
})

export const Chevron = styled('span', {
  base: { display: 'flex', flexShrink: '0', color: 'ink.subtle' },
})

export const Footnote = styled('p', {
  base: { margin: '0', textStyle: 'support', color: 'ink.muted' },
})

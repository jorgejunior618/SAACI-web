import { styled } from '@/styled-system/jsx'

export const Question = styled('p', {
  base: { margin: '0', textStyle: 'support', color: 'ink.muted' },
})

export const Item = styled('div', {
  base: { display: 'flex', flexDirection: 'column', marginTop: '3' },
})

export const Number = styled('span', {
  base: { textStyle: 'caption', color: 'ink.muted' },
})

export const Name = styled('span', {
  base: { marginTop: '2px', textStyle: 'bodyStrong' },
})

export const Rule = styled('span', {
  base: { textStyle: 'support', color: 'ink.muted' },
})

export const Actions = styled('div', {
  base: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2', marginTop: '4' },
})

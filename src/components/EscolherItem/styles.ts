import { styled } from '@/styled-system/jsx'

export const Wrapper = styled('section', {
  base: { display: 'flex', flexDirection: 'column', gap: '3' },
})

export const Empty = styled('p', {
  base: { margin: '0', textStyle: 'support', color: 'ink.muted' },
})

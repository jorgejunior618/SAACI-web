import { styled } from '@/styled-system/jsx'

export const Root = styled('div', {
  base: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4' },
})

export const Result = styled('p', {
  base: { margin: '0', textStyle: 'support', color: 'ink.muted' },
})

import { styled } from '@/styled-system/jsx'

export const Root = styled('div', {
  base: { display: 'flex', flexDirection: 'column', gap: '2' },
})

export const Status = styled('p', {
  base: { margin: '0', textStyle: 'support', color: 'ink.muted', textAlign: 'center' },
})

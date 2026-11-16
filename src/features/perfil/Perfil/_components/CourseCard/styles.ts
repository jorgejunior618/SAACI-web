import { styled } from '@/styled-system/jsx'

export const Root = styled('div', {
  base: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '3' },
})

export const Text = styled('div', {
  base: { display: 'flex', flexDirection: 'column', minWidth: '0' },
})

export const Name = styled('p', {
  base: { margin: '0', textStyle: 'bodyStrong', color: 'ink' },
})

export const Detail = styled('p', {
  base: { margin: '0', textStyle: 'support', color: 'ink.muted' },
})

export const Action = styled('div', {
  base: { display: 'flex', alignItems: 'center', gap: '1', flexShrink: '0' },
})

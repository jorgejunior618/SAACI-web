import { styled } from '@/styled-system/jsx'

export const Caption = styled('p', {
  base: { margin: '0', textStyle: 'caption', color: 'ink.muted' },
})

export const Title = styled('h2', {
  base: { margin: '1 0 0', textStyle: 'title' },
})

export const Text = styled('p', {
  base: { margin: '2 0 4', textStyle: 'support', color: 'ink.muted' },
})

export const Actions = styled('div', {
  base: { display: 'flex', flexDirection: 'column', gap: '3' },
})

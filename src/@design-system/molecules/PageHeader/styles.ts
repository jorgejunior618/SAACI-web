import { styled } from '@/styled-system/jsx'

export const Header = styled('div', {
  base: { display: 'flex', flexDirection: 'column', gap: '1' },
})

export const Eyebrow = styled('p', {
  base: { margin: '0', textStyle: 'support', color: 'ink.muted' },
})

export const Title = styled('h1', {
  base: { margin: '0', textStyle: 'heading' },
})

export const Lead = styled('div', {
  base: { margin: '0', textStyle: 'body', color: 'ink.muted', '& p': { margin: '0' } },
})

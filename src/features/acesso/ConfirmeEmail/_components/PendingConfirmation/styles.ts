import { styled } from '@/styled-system/jsx'

export const Page = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6',
    minHeight: '100dvh',
    paddingInline: '6',
    paddingBlock: '6',
  },
})

export const Heading = styled('div', {
  base: { display: 'flex', flexDirection: 'column', gap: '2' },
})

export const Title = styled('h1', {
  base: { margin: '0', textStyle: 'title' },
})

export const Lead = styled('p', {
  base: { margin: '0', textStyle: 'body', color: 'ink.muted' },
})

export const Email = styled('p', {
  base: { margin: '0', textStyle: 'bodyStrong', color: 'ink', overflowWrap: 'anywhere' },
})

export const Actions = styled('div', {
  base: { display: 'flex', flexDirection: 'column', gap: '2' },
})

export const Footer = styled('div', {
  base: {
    display: 'flex',
    justifyContent: 'center',
    marginBlockStart: 'auto',
  },
})

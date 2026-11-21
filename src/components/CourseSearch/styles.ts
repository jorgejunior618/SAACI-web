import { styled } from '@/styled-system/jsx'

export const Root = styled('section', {
  base: { display: 'flex', flexDirection: 'column', gap: '6' },
})

export const Intro = styled('div', {
  base: { display: 'flex', flexDirection: 'column', gap: '2' },
})

export const Title = styled('h1', {
  base: { margin: '0', textStyle: 'title', color: 'ink' },
})

export const Lead = styled('p', {
  base: { margin: '0', textStyle: 'body', color: 'ink.muted' },
})

export const Group = styled('div', {
  base: { display: 'flex', flexDirection: 'column', gap: '3' },
})

export const GroupTitle = styled('h2', {
  base: { margin: '0', textStyle: 'label', color: 'ink' },
})

export const Footnote = styled('p', {
  base: { margin: '0', textStyle: 'body', color: 'ink.muted' },
})

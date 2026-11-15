import { styled } from '@/styled-system/jsx'

export const Page = styled('div', {
  base: { display: 'flex', flexDirection: 'column', gap: '4', padding: '4' },
})

export const Title = styled('h2', {
  base: { margin: '0', textStyle: 'title', color: 'ink' },
})

export const Text = styled('p', {
  base: { margin: '0', textStyle: 'body', color: 'ink' },
})

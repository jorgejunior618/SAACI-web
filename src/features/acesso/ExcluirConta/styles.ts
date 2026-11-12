import { styled } from '@/styled-system/jsx'

export const Page = styled('form', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6',
    paddingInline: '6',
    paddingBlockStart: '6',
    paddingBlockEnd: '6',
  },
})

export const Consequence = styled('p', {
  base: { margin: '0', textStyle: 'body', color: 'ink' },
})

export const Actions = styled('div', {
  base: { display: 'flex', flexDirection: 'column', gap: '2' },
})

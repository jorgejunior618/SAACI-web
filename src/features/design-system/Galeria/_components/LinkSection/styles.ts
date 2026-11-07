import { styled } from '@/styled-system/jsx'

export const Specimens = styled('div', {
  base: {
    display: 'grid',
    gap: '4',
    gridTemplateColumns: 'repeat(auto-fill, minmax(16rem, 1fr))',
  },
})

export const Paragraph = styled('p', {
  base: { textStyle: 'body' },
})

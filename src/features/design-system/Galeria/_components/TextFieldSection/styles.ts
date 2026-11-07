import { styled } from '@/styled-system/jsx'

export const Specimens = styled('div', {
  base: {
    display: 'grid',
    gap: '4',
    gridTemplateColumns: 'repeat(auto-fill, minmax(18rem, 1fr))',
  },
})

export const Wide = styled('div', {
  base: { width: '100%' },
})

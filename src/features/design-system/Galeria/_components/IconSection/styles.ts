import { styled } from '@/styled-system/jsx'

export const Specimens = styled('div', {
  base: {
    display: 'grid',
    gap: '4',
    gridTemplateColumns: 'repeat(auto-fill, minmax(10rem, 1fr))',
  },
})

export const Line = styled('span', {
  base: { display: 'inline-flex', alignItems: 'center', gap: '2', textStyle: 'bodyStrong' },
})

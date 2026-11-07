import { styled } from '@/styled-system/jsx'

export const Specimens = styled('div', {
  base: {
    display: 'grid',
    gap: '4',
    gridTemplateColumns: 'repeat(auto-fill, minmax(10rem, 1fr))',
  },
})

export const OnBrand = styled('span', {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '2',
    paddingInline: '4',
    minHeight: 'control',
    background: 'brand',
    color: 'brand.on',
    borderRadius: 'control',
    textStyle: 'bodyStrong',
  },
})

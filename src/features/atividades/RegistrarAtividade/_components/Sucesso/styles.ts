import { styled } from '@/styled-system/jsx'

export const Hero = styled('p', {
  base: {
    margin: '0 0 2',
    textStyle: 'hero',
    color: 'brand.text',
    animation: 'pop token(durations.pop) token(easings.out) both',
  },
})

export const Total = styled('div', {
  base: { marginTop: '2' },
})

export const Actions = styled('div', {
  base: { display: 'flex', flexDirection: 'column', gap: '2', marginTop: 'auto', paddingTop: '6' },
})

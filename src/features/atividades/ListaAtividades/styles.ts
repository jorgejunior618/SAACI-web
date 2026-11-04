import { styled } from '@/styled-system/jsx'

export const Section = styled('section', {
  base: { display: 'flex', flexDirection: 'column', gap: '2' },
})

export const SectionTitle = styled('h2', {
  base: { margin: '2 0 1', textStyle: 'title' },
})

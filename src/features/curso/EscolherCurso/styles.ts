import { styled } from '@/styled-system/jsx'

export const Section = styled('section', {
  base: { display: 'flex', flexDirection: 'column', gap: '3' },
})

export const SectionTitle = styled('h2', {
  base: { margin: '0', textStyle: 'label', color: 'ink.muted' },
})

export const Support = styled('p', {
  base: { margin: '0', textStyle: 'support', color: 'ink.muted' },
})

export const Meta = styled('div', {
  base: { display: 'flex', flexDirection: 'column' },
})

export const Goal = styled('p', {
  base: { margin: '0', textStyle: 'heroXl', color: 'brand.text' },
})

export const Form = styled('form', {
  base: { display: 'flex', flexDirection: 'column', gap: '6' },
})

export const Bottom = styled('div', {
  base: { marginTop: 'auto', paddingTop: '6' },
})

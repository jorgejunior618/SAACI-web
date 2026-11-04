import { styled } from '@/styled-system/jsx'

export const Section = styled('section', {
  base: { display: 'flex', flexDirection: 'column', gap: '2' },
})

export const Label = styled('h2', {
  base: { margin: '0', textStyle: 'label' },
})

export const Hint = styled('p', {
  base: { margin: '-4px 0 0', textStyle: 'support', color: 'ink.muted' },
})

export const Reading = styled('div', {
  base: { display: 'flex', flexDirection: 'column', gap: '2' },
})

export const Form = styled('form', {
  base: { display: 'flex', flexDirection: 'column', gap: '6' },
})

export const Back = styled('p', {
  base: { margin: '0', textStyle: 'support', color: 'ink.muted' },
})

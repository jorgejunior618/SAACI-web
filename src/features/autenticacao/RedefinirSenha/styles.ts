import { styled } from '@/styled-system/jsx'

export const Header = styled('div', {
  base: { display: 'flex', flexDirection: 'column', gap: '4' },
})

export const Form = styled('form', {
  base: { display: 'flex', flexDirection: 'column', gap: '6' },
})

export const Note = styled('p', {
  base: { margin: '-8px 0 0', textAlign: 'center', textStyle: 'support', color: 'ink.muted' },
})

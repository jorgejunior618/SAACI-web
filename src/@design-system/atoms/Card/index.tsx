import { styled } from '@/styled-system/jsx'

// Borda, não sombra.
export const Card = styled('section', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    background: 'surface',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'line',
    borderRadius: 'card',
  },
  variants: {
    padding: {
      none: {},
      md: { padding: '4' },
    },
  },
  defaultVariants: { padding: 'md' },
})

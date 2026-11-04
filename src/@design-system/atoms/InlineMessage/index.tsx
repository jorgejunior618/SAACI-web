import { styled } from '@/styled-system/jsx'

// Uma frase de 14px, sem caixa.
export const InlineMessage = styled('p', {
  base: { margin: '0', textStyle: 'support', color: 'ink.muted' },
  variants: {
    tone: {
      neutral: {},
      warning: { color: 'warning' },
      danger: { color: 'danger' },
      success: { color: 'brand.text' },
    },
  },
  defaultVariants: { tone: 'neutral' },
})

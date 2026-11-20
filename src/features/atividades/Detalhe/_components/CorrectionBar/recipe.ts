import { cva } from '@/styled-system/css'

// O número fica em `warning` quando a correção faz a atividade contar menos que o valor dela.
export const summaryValue = cva({
  base: { textStyle: 'title', fontVariantNumeric: 'tabular-nums' },
  variants: {
    tone: {
      neutral: { color: 'ink' },
      warning: { color: 'warning' },
    },
  },
  defaultVariants: { tone: 'neutral' },
})

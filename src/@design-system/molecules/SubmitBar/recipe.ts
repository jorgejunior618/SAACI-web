import { cva } from '@/styled-system/css'

// O número fica em `warning` quando a atividade vai contar menos do que vale (parcial ou não conta).
export const summaryValue = cva({
  base: {
    textStyle: 'title',
    fontVariantNumeric: 'tabular-nums',
  },
  variants: {
    tone: {
      neutral: { color: 'ink' },
      warning: { color: 'warning' },
    },
  },
  defaultVariants: { tone: 'neutral' },
})

import { cva } from '@/styled-system/css'

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

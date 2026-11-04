import { cva } from '@/styled-system/css'

export const textLink = cva({
  base: {
    display: 'inline',
    padding: '0',
    border: '0',
    background: 'none',
    font: 'inherit',
    fontWeight: '500',
    textDecoration: 'underline',
    textDecorationThickness: '1px',
    textUnderlineOffset: '3px',
    cursor: 'pointer',
    _disabled: { color: 'ink.muted', cursor: 'not-allowed', textDecoration: 'none' },
  },
  variants: {
    tone: {
      brand: { color: 'brand.text' },
      muted: { color: 'ink.muted' },
      danger: { color: 'danger' },
    },
  },
  defaultVariants: { tone: 'brand' },
})

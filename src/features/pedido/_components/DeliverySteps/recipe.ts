import { cva } from '@/styled-system/css'

// O círculo de 24px e o traço de 1,5px não têm token: são medidas do desenho.
export const marker = cva({
  base: {
    display: 'grid',
    placeItems: 'center',
    boxSizing: 'border-box',
    width: '24px',
    height: '24px',
    borderRadius: 'full',
    textStyle: 'caption',
    fontVariantNumeric: 'tabular-nums',
  },
  variants: {
    state: {
      // Já foi feito: círculo cheio com o check.
      done: { background: 'brand', color: 'brand.on' },
      // O passo da vez: contorno da marca.
      current: {
        borderWidth: '1.5px',
        borderStyle: 'solid',
        borderColor: 'brand',
        color: 'brand.text',
      },
      // Os que vêm depois: contorno neutro.
      upcoming: {
        borderWidth: '1.5px',
        borderStyle: 'solid',
        borderColor: 'line.strong',
        color: 'ink.muted',
      },
    },
  },
  defaultVariants: { state: 'upcoming' },
})

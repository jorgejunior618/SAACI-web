import { cva } from '@/styled-system/css'

// O círculo de 24px e o traço de 1,5px não têm token: são medidas do desenho (`sizes` só tem toque,
// barras e coluna).
export const mark = cva({
  base: {
    display: 'grid',
    placeItems: 'center',
    boxSizing: 'border-box',
    width: '24px',
    height: '24px',
    borderRadius: 'full',
  },
  variants: {
    state: {
      done: { background: 'brand', color: 'brand.on' },
      todo: { borderWidth: '1.5px', borderStyle: 'dashed', borderColor: 'warning' },
    },
  },
  defaultVariants: { state: 'todo' },
})

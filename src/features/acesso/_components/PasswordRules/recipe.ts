import { cva } from '@/styled-system/css'

// Círculo de 20px: cheio e com check quando a regra vale, só contorno quando falta.
export const mark = cva({
  base: {
    display: 'inline-grid',
    placeItems: 'center',
    flexShrink: 0,
    width: '20px',
    height: '20px',
    borderRadius: 'full',
    borderWidth: '2px',
    borderStyle: 'solid',
  },
  variants: {
    met: {
      true: { borderColor: 'brand', background: 'brand', color: 'brand.on' },
      false: { borderColor: 'warning', background: 'transparent' },
    },
  },
})

export const rule = cva({
  base: { display: 'flex', alignItems: 'center', gap: '3', textStyle: 'body' },
  variants: {
    met: {
      true: { color: 'brand.text' },
      false: { color: 'warning' },
    },
  },
})

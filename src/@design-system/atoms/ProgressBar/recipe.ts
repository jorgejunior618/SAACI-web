import { cva } from '@/styled-system/css'

// 4px e 6px são medidas do componente: `sizes` não tem escala numérica.
export const progressTrack = cva({
  base: {
    borderRadius: 'control',
    background: 'progress.track',
    overflow: 'hidden',
  },
  variants: {
    size: {
      sm: { height: '4px' },
      md: { height: '6px' },
    },
  },
  defaultVariants: { size: 'sm' },
})

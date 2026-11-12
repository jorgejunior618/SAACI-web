import { cva } from '@/styled-system/css'

// 32px é o desenho do marcador do protótipo, sem token na escala.
export const marker = cva({
  base: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    width: '32px',
    height: '32px',
    borderRadius: 'full',
    textStyle: 'bodyStrong',
  },
  variants: {
    // `current` é o passo em que a pessoa está: o único preenchido.
    state: {
      current: { background: 'brand', color: 'brand.on' },
      next: { border: '1px solid', borderColor: 'line.strong', color: 'ink.muted' },
    },
  },
  defaultVariants: { state: 'next' },
})

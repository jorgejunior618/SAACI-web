import { cva } from '@/styled-system/css'

export const link = cva({
  base: {
    color: 'brand.text',
    fontWeight: '500',
    textDecorationLine: 'underline',
    textDecorationThickness: '1px',
    textUnderlineOffset: '3px',
    cursor: 'pointer',
  },
  variants: {
    // Link sozinho na linha precisa de alvo de toque de 48px; dentro de texto, não.
    standalone: {
      true: { display: 'inline-flex', alignItems: 'center', minHeight: 'touch' },
    },
  },
})

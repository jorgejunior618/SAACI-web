import { cva } from '@/styled-system/css'

export const badge = cva({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    height: '20px',
    paddingX: '6px',
    borderRadius: 'control',
    background: 'surface.muted',
    textStyle: 'caption',
    whiteSpace: 'nowrap',
  },
  variants: {
    status: {
      conta: { color: 'brand.text' },
      parcial: { color: 'warning' },
      nao_conta: { color: 'danger' },
    },
  },
})

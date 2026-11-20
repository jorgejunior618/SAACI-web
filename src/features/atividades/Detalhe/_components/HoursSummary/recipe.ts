import { cva } from '@/styled-system/css'

// O número grande leva a cor do status, a mesma do `Badge` do topo.
export const hoursNumber = cva({
  base: { textStyle: 'display', fontVariantNumeric: 'tabular-nums' },
  variants: {
    status: {
      conta: { color: 'brand.text' },
      parcial: { color: 'warning' },
      nao_conta: { color: 'danger' },
    },
  },
  defaultVariants: { status: 'conta' },
})

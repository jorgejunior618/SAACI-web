import { cva } from '@/styled-system/css'

// O número da tela: `display` já traz tabular-nums. Completo passa para o verde de texto da marca.
export const totalNumber = cva({
  base: { display: 'block', textStyle: 'display', color: 'ink' },
  variants: {
    done: {
      true: { color: 'brand.text' },
    },
  },
})

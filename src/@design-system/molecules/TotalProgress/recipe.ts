import { cva } from '@/styled-system/css'

// O número da tela: `display` traz o tabular-nums e a família; o tamanho de 56px (linha de 60px) e o
// espaçamento entre letras são medidas do componente, sem token. Os 4px de cima somam ao respiro
// do cartão para dar os 20px do desenho. Completo passa para o verde de texto da marca.
export const totalNumber = cva({
  base: {
    display: 'block',
    textStyle: 'display',
    fontSize: '56px',
    lineHeight: '60px',
    letterSpacing: '-1.6px',
    marginBlockStart: '1',
    color: 'ink',
  },
  variants: {
    done: {
      true: { color: 'brand.text' },
    },
  },
})

import { cva } from '@/styled-system/css'

// O número da tela: `display` traz o tabular-nums e a família; o tamanho de 56px (linha de 60px) e o
// espaçamento entre letras são medidas do componente, sem token. Os 4px de cima somam ao respiro
// do cartão para dar os 20px do desenho. Compacto, o número cai para `title`, na linha do rótulo.
// Completo passa para o verde de texto da marca.
export const totalNumber = cva({
  base: {
    display: 'block',
    fontVariantNumeric: 'tabular-nums',
    color: 'ink',
  },
  variants: {
    size: {
      default: {
        textStyle: 'display',
        fontSize: '56px',
        lineHeight: '60px',
        letterSpacing: '-1.6px',
        marginBlockStart: '1',
      },
      compact: { textStyle: 'title', flexShrink: '0' },
    },
    done: {
      true: { color: 'brand.text' },
    },
  },
  defaultVariants: { size: 'default' },
})

// Compacto: número e rótulo na mesma linha de base, e o rótulo quebra linha se faltar espaço.
export const totalHead = cva({
  base: {},
  variants: {
    size: {
      default: {},
      compact: { display: 'flex', alignItems: 'baseline', gap: '2' },
    },
  },
  defaultVariants: { size: 'default' },
})

export const totalLabel = cva({
  base: { margin: '0', marginBlockStart: '1', textStyle: 'support', color: 'ink.muted' },
  variants: {
    size: {
      default: {},
      compact: { marginBlockStart: '0' },
    },
  },
  defaultVariants: { size: 'default' },
})

// 16px entre o número e a barra; no compacto, 12px.
export const totalBar = cva({
  base: { marginBlockStart: '4' },
  variants: {
    size: {
      default: {},
      compact: { marginBlockStart: '3' },
    },
  },
  defaultVariants: { size: 'default' },
})

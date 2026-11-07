import { cva } from '@/styled-system/css'

// A arte não ganha círculo de fundo: o símbolo ou o ícone de traço aparece direto sobre a tela.
export const stateArt = cva({
  base: {
    display: 'flex',
    marginBlockEnd: '4',
  },
  variants: {
    variant: {
      // O símbolo do SAACI tem as próprias cores.
      empty: {},
      success: { color: 'brand.text' },
      connectionError: { color: 'danger' },
      loading: {},
    },
  },
})

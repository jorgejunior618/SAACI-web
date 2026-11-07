import { cva } from '@/styled-system/css'

// Frase em linha: só a cor do texto diz o tom. Sem caixa, sem ícone.
export const inlineNotice = cva({
  base: { margin: '0', textStyle: 'support' },
  variants: {
    tone: {
      neutral: { color: 'ink.muted' },
      warning: { color: 'warning' },
      danger: { color: 'danger' },
      // Não existe token `success`: o verde de texto da marca faz esse papel.
      success: { color: 'brand.text' },
    },
  },
  defaultVariants: { tone: 'neutral' },
})

// Bloco discreto: fundo sobre o creme, sem borda e sem ícone.
export const blockNotice = cva({
  base: {
    display: 'flex',
    flexDirection: 'column',
    // O protótipo usa 2px; a escala de 4px não tem esse valor.
    gap: '1',
    paddingBlock: '3',
    paddingInline: '4',
    borderRadius: 'control',
    background: 'surface',
  },
  variants: {
    // Dentro de cartão, o fundo `surface` some contra o próprio cartão.
    inCard: {
      true: { background: 'surface.muted' },
    },
  },
})

// O título carrega o tom do bloco.
export const noticeTitle = cva({
  base: { margin: '0', textStyle: 'bodyStrong' },
  variants: {
    tone: {
      neutral: { color: 'ink' },
      warning: { color: 'warning' },
      danger: { color: 'danger' },
      success: { color: 'brand.text' },
    },
  },
  defaultVariants: { tone: 'neutral' },
})

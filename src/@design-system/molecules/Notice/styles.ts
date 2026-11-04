import { cva } from '@/styled-system/css'
import { styled } from '@/styled-system/jsx'

// Bloco discreto: sem borda colorida e sem ícone. O tom muda só a cor do título.
export const Box = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    paddingY: '3',
    paddingX: '4',
    borderRadius: 'control',
  },
  variants: {
    surface: {
      page: { background: 'surface' },
      card: { background: 'surface.muted' },
    },
  },
  defaultVariants: { surface: 'page' },
})

export const title = cva({
  base: { margin: '0', textStyle: 'bodyStrong', color: 'ink' },
  variants: {
    tone: {
      neutral: {},
      success: { color: 'brand.text' },
      warning: { color: 'warning' },
      danger: { color: 'danger' },
    },
  },
})

export const Body = styled('div', {
  base: {
    margin: '0',
    textStyle: 'support',
    color: 'ink.muted',
    '& p': { margin: '0' },
  },
})

export const Actions = styled('div', {
  base: { display: 'flex', flexWrap: 'wrap', gap: '2 16px', marginTop: '2', textStyle: 'support' },
})

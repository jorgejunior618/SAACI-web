import { cva } from '@/styled-system/css'
import { styled } from '@/styled-system/jsx'

// Fica acima da barra inferior quando ela existe: o layout define --footer-bottom.
export const Footer = styled('footer', {
  base: {
    position: 'sticky',
    bottom: 'var(--footer-bottom, 0px)',
    zIndex: '5',
    display: 'flex',
    flexDirection: 'column',
    gap: '2',
    flexShrink: '0',
    paddingTop: '3',
    paddingX: '4',
    paddingBottom: '4',
    background: 'surface',
    borderTopWidth: '1px',
    borderTopStyle: 'solid',
    borderTopColor: 'line',
  },
  variants: {
    isPlain: {
      true: { background: 'surface.sunken', borderTopWidth: '0' },
    },
  },
})

export const Sum = styled('div', {
  base: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    gap: '3',
    textStyle: 'support',
    color: 'ink.muted',
  },
})

export const value = cva({
  base: { textStyle: 'title', fontVariantNumeric: 'tabular-nums' },
  variants: {
    tone: {
      neutral: { color: 'ink' },
      warning: { color: 'warning' },
      muted: { color: 'ink.muted', fontWeight: '500' },
    },
  },
})

export const Before = styled('span', {
  base: { marginRight: '2', textStyle: 'support', color: 'ink.muted' },
})

export const Note = styled('p', {
  base: { margin: '0', textStyle: 'support', color: 'ink.muted', textAlign: 'center' },
})

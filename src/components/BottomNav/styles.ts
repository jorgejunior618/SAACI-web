import { css } from '@/styled-system/css'
import { styled } from '@/styled-system/jsx'

export const Nav = styled('nav', {
  base: {
    position: 'sticky',
    bottom: '0',
    zIndex: '10',
    display: 'grid',
    gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
    flexShrink: '0',
    height: 'calc(token(sizes.bottomnav) + env(safe-area-inset-bottom))',
    paddingBottom: 'env(safe-area-inset-bottom)',
    background: 'surface',
    borderTopWidth: '1px',
    borderTopStyle: 'solid',
    borderTopColor: 'line',
  },
})

export const link = css({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '1',
  textStyle: 'caption',
  color: 'ink.muted',
  textDecoration: 'none',
  '& svg': { color: 'ink.subtle' },
  '&[aria-current=page]': { color: 'brand.text', fontWeight: '600' },
  '&[aria-current=page] svg': { color: 'brand.text', strokeWidth: '2' },
})

// Botão central Registrar: círculo verde que sobe 22px acima da barra.
export const Fab = styled('span', {
  base: {
    display: 'grid',
    placeItems: 'center',
    width: 'fab',
    height: 'fab',
    marginTop: '-22px',
    borderRadius: 'full',
    background: 'brand',
    borderWidth: '4px',
    borderStyle: 'solid',
    borderColor: 'surface',
    boxSizing: 'content-box',
    '& svg': { color: 'brand.on !important', strokeWidth: '2' },
  },
})

import { styled } from '@/styled-system/jsx'

export const Root = styled('nav', {
  base: {
    display: 'grid',
    gridAutoFlow: 'column',
    gridAutoColumns: '1fr',
    // 60px mais a área segura de baixo (o indicador do iPhone); mínima, para o rótulo poder crescer.
    minHeight: 'calc(token(sizes.bottomnav) + env(safe-area-inset-bottom))',
    paddingBottom: 'env(safe-area-inset-bottom)',
    background: 'surface',
    borderBlockStartWidth: '1px',
    borderBlockStartStyle: 'solid',
    borderBlockStartColor: 'line',
  },
})

export const Item = styled('a', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1',
    minWidth: '0',
    minHeight: 'touch',
    color: 'ink.muted',
    textStyle: 'caption',
    textDecoration: 'none',
    WebkitTapHighlightColor: 'transparent',
    '&[aria-current="page"]': {
      color: 'brand.text',
      fontWeight: '600',
      // O Icon fixa 1,5 no atributo; o CSS do ativo engrossa o traço para 2.
      '& svg': { strokeWidth: '2' },
    },
  },
})

// O ícone parado é mais claro que o rótulo; o ativo herda a cor do item.
export const IconSlot = styled('span', {
  base: {
    display: 'inline-flex',
    color: 'ink.subtle',
    'a[aria-current="page"] &': { color: 'inherit' },
  },
})

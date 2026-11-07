import { styled } from '@/styled-system/jsx'

import { topBar } from './recipe'

export const Root = styled('header', topBar)

// Botão só com ícone: o alvo é de 48px e o nome acessível vem do `aria-label` de quem usa.
const iconButton = {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 'none',
    width: 'touch',
    height: 'touch',
    padding: '0',
    border: '0',
    borderRadius: 'control',
    background: 'transparent',
    color: 'ink',
    cursor: 'pointer',
    WebkitTapHighlightColor: 'transparent',
    '&:active': { background: 'surface.muted' },
  },
} as const

export const IconLink = styled('a', iconButton)
export const IconButton = styled('button', iconButton)

export const Brand = styled('div', {
  base: {
    flex: '1',
    display: 'flex',
    alignItems: 'center',
    gap: '2',
    minWidth: '0',
    color: 'brand.text',
    textStyle: 'bodyStrong',
    fontWeight: '600',
    letterSpacing: '-0.2px',
  },
})

export const Title = styled('h1', {
  base: {
    flex: '1',
    minWidth: '0',
    margin: '0',
    textStyle: 'bodyStrong',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
})

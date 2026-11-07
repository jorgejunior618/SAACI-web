import { styled } from '@/styled-system/jsx'

import { activityRow } from './recipe'

export const Root = styled('li', activityRow)

// A área de toque do checkbox tem 48px, mas o desenho ocupa só os 18px do controle: as margens
// negativas devolvem o espaço extra à linha para o título não se mover.
export const Check = styled('label', {
  base: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 'none',
    width: '48px',
    height: '48px',
    marginBlockStart: '-12px',
    marginInline: '-15px',
    cursor: 'pointer',
  },
})

export const Input = styled('input', {
  base: {
    appearance: 'none',
    display: 'grid',
    placeContent: 'center',
    width: '18px',
    height: '18px',
    margin: '0',
    borderWidth: '1.5px',
    borderStyle: 'solid',
    borderColor: 'line.strong',
    borderRadius: '4px',
    background: 'surface',
    cursor: 'pointer',
    _focusVisible: { outline: '2px solid token(colors.focus)', outlineOffset: '2px' },
    '&:checked': { borderColor: 'brand', background: 'brand' },
    '&:checked::after': {
      content: '""',
      width: '9px',
      height: '5px',
      borderStyle: 'solid',
      borderColor: 'brand.on',
      borderWidth: '0',
      borderBottomWidth: '2px',
      borderLeftWidth: '2px',
      transform: 'translateY(-1px) rotate(-45deg)',
    },
  },
})

// O link cobre título, metadados e seta. O checkbox fica fora dele.
export const Main = styled('a', {
  base: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '2',
    flex: '1',
    minWidth: '0',
    color: 'inherit',
    textDecoration: 'none',
  },
})

export const Texts = styled('span', {
  base: { flex: '1', minWidth: '0' },
})

export const Title = styled('span', {
  base: {
    display: 'block',
    textStyle: 'bodyStrong',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
})

export const Meta = styled('span', {
  base: {
    display: 'block',
    textStyle: 'support',
    color: 'ink.muted',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
})

export const Partial = styled('span', { base: { color: 'warning' } })

export const Danger = styled('span', { base: { color: 'danger' } })

export const Dot = styled('span', { base: { color: 'ink.subtle' } })

export const Arrow = styled('span', {
  base: {
    display: 'inline-flex',
    flex: 'none',
    // Alinha o ícone de 16px com a primeira linha de 24px.
    marginBlockStart: '1',
    color: 'ink.subtle',
  },
})

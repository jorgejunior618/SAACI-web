// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import { styled } from '@/styled-system/jsx'

import { activityRow } from './recipe'

export const Root = styled('li', activityRow)

// O desenho do checkbox ocupa 18px numa caixa de 48px; as margens negativas devolvem o espaço extra
// à linha para o título não se mover. A área de toque agora é a linha inteira (`SelectMain`).
export const Check = styled('span', {
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
    // Mesmo desenho do `Button` desabilitado: fundo `line` cheio, que lê como "não dá" nos dois temas.
    _disabled: { borderColor: 'line', background: 'line', cursor: 'not-allowed' },
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

// No modo de seleção a linha inteira é o rótulo do checkbox: tocar em qualquer ponto marca. O vão de
// 12px mantém o título no recuo de 46px da divisória.
export const SelectMain = styled('label', {
  base: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '3',
    flex: '1',
    minWidth: '0',
    paddingBlock: '3',
    paddingInlineStart: '4',
    paddingInlineEnd: '3',
    cursor: 'pointer',
    // Desabilitada: todo o texto vai para `ink.muted`, inclusive o "Não conta" em `danger`, que numa
    // linha sem ação chamaria atenção como se pedisse algo. O texto continua dizendo o porquê.
    '&:has(input:disabled)': {
      cursor: 'not-allowed',
      color: 'ink.muted',
      '& span': { color: 'ink.muted' },
    },
  },
})

// Fora do modo de seleção, o link cobre título, metadados e seta.
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

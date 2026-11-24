// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import { styled } from '@/styled-system/jsx'

// Âncora do painel flutuante: ele se posiciona em relação a este bloco, que termina no campo.
export const Root = styled('div', {
  base: { position: 'relative' },
})

// O painel fica por cima do que vem depois do campo e não empurra nada. Passou de ~5 itens, rola
// dentro dele. Borda e sem sombra, como o resto do sistema.
export const Popup = styled('div', {
  base: {
    position: 'absolute',
    insetInline: '0',
    top: '100%',
    marginBlockStart: '1',
    zIndex: 2,
    maxHeight: '280px',
    overflowY: 'auto',
    overscrollBehavior: 'contain',
    background: 'surface.raised',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'line.strong',
    borderRadius: 'card',
  },
})

// A linha inteira é o alvo de toque. A escolha é o fundo `brand.soft`; o item sob o teclado leva
// contorno, porque o foco real fica no campo.
export const Option = styled('div', {
  base: {
    position: 'relative',
    display: 'grid',
    gridTemplateColumns: '24px 1fr',
    columnGap: '3',
    minHeight: 'touch',
    paddingBlock: '3',
    paddingInline: '4',
    cursor: 'pointer',
    WebkitTapHighlightColor: 'transparent',
    // 16px de padding + 24px do número + 12px de espaço.
    '&:not(:first-child)::before': {
      content: '""',
      position: 'absolute',
      top: '0',
      insetInlineStart: '52px',
      insetInlineEnd: '0',
      borderTopWidth: '1px',
      borderTopStyle: 'solid',
      borderTopColor: 'line',
    },
    '&[aria-selected="true"]': { background: 'brand.soft' },
    '&[aria-selected="false"]:hover': { background: 'surface.muted' },
    '&[data-active="true"]': {
      outline: '2px solid token(colors.focus)',
      outlineOffset: '-2px',
    },
  },
})

// O número é o que o aluno escreve no formulário oficial: sempre visível, sem cor de destaque.
export const ItemNumber = styled('span', {
  base: {
    textStyle: 'body',
    color: 'ink.muted',
    fontVariantNumeric: 'tabular-nums',
    textAlign: 'end',
  },
})

export const Text = styled('span', {
  base: { display: 'flex', flexDirection: 'column', minWidth: '0' },
})

export const Name = styled('span', {
  base: { textStyle: 'bodyStrong', color: 'ink' },
})

export const Rule = styled('span', {
  base: { textStyle: 'support', color: 'ink.muted' },
})

// A frase de busca vazia aparece no mesmo painel, para o lugar da lista não mudar.
export const EmptyBox = styled('p', {
  base: {
    position: 'absolute',
    insetInline: '0',
    top: '100%',
    marginBlockStart: '1',
    zIndex: 2,
    margin: '0',
    padding: '4',
    textStyle: 'support',
    color: 'ink.muted',
    background: 'surface.raised',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'line.strong',
    borderRadius: 'card',
  },
})

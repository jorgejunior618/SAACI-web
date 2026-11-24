// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import { styled } from '@/styled-system/jsx'

import { choice } from './recipe'

export const Fieldset = styled('fieldset', {
  base: { border: '0', margin: '0', padding: '0', minInlineSize: '0' },
})

export const Legend = styled('legend', {
  base: { textStyle: 'label', color: 'ink', padding: '0', marginBlockEnd: '2' },
})

export const ErrorText = styled('p', {
  base: { textStyle: 'label', color: 'danger', marginBlockEnd: '2' },
})

export const List = styled('div', {
  base: {
    background: 'surface',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'line',
    borderRadius: 'card',
    overflow: 'hidden',
  },
})

export const Choice = styled('label', choice)

// Controle desenhado à mão (18px): o nativo é escondido, mas segue com teclado e foco do navegador.
export const Input = styled('input', {
  base: {
    appearance: 'none',
    flex: 'none',
    display: 'grid',
    placeContent: 'center',
    // Alinha o controle com a primeira linha de texto de 24px.
    marginBlockStart: '3px',
    width: '18px',
    height: '18px',
    borderWidth: '1.5px',
    borderStyle: 'solid',
    borderColor: 'line.strong',
    background: 'surface',
    cursor: 'pointer',
    _focusVisible: { outline: '2px solid token(colors.focus)', outlineOffset: '2px' },
    '&[type="radio"]': { borderRadius: 'full' },
    '&[type="radio"]:checked': {
      borderColor: 'brand',
      boxShadow: 'inset 0 0 0 3.5px token(colors.surface), inset 0 0 0 9px token(colors.brand)',
    },
    '&[type="checkbox"]': { borderRadius: '4px' },
    '&[type="checkbox"]:checked': { borderColor: 'brand', background: 'brand' },
    '&[type="checkbox"]:checked::after': {
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

export const Text = styled('span', {
  base: { display: 'flex', flexDirection: 'column', textStyle: 'body', color: 'ink' },
})

// O efeito da escolha ("Conta metade") fica sempre visível, é a orientação no momento de escolher.
export const Effect = styled('small', {
  base: { textStyle: 'support', color: 'ink.muted' },
})

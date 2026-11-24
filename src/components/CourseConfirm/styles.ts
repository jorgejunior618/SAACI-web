// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import { styled } from '@/styled-system/jsx'

// Mesma altura útil da busca: o que sobra depois da TopBar, para o rodapé ficar na base da tela.
export const Form = styled('form', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: 'calc(100dvh - token(sizes.topbar) - env(safe-area-inset-top))',
  },
})

export const Body = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1',
    gap: '6',
    paddingInline: '6',
    paddingBlockStart: '6',
    paddingBlockEnd: '2',
  },
})

export const Summary = styled('div', {
  base: { display: 'flex', flexDirection: 'column', gap: '2' },
})

export const Eyebrow = styled('p', {
  base: { margin: '0', textStyle: 'body', color: 'ink.muted' },
})

export const Lead = styled('h1', {
  base: { margin: '0', textStyle: 'title', color: 'ink' },
})

// O número da meta usa o `display` com o tamanho de 56px do TotalProgress (medida sem token).
export const Hours = styled('p', {
  base: {
    margin: '0',
    textStyle: 'display',
    fontSize: '56px',
    lineHeight: '60px',
    letterSpacing: '-1.6px',
    fontVariantNumeric: 'tabular-nums',
    color: 'brand.text',
  },
})

export const Explanation = styled('p', {
  base: { margin: '0', textStyle: 'body', color: 'ink' },
})

export const Fields = styled('div', {
  base: { display: 'flex', flexDirection: 'column', gap: '2' },
})

// Fica colado na base ao rolar e ocupa a largura toda, por isso fica fora do `Body`.
export const Footer = styled('div', {
  base: {
    position: 'sticky',
    bottom: '0',
    padding: '4',
    background: 'surface',
    borderBlockStartWidth: '1px',
    borderBlockStartStyle: 'solid',
    borderBlockStartColor: 'line',
  },
})

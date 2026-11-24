// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import { styled } from '@/styled-system/jsx'

export const Title = styled('p', {
  base: { margin: '0', textStyle: 'label', color: 'brand.text' },
})

// A regra fica 4px abaixo do título: é a frase que o aluno precisa ler antes de preencher.
export const Rule = styled('p', {
  base: { margin: '0', marginBlockStart: '1', textStyle: 'body', color: 'ink' },
})

// Pode quebrar linha em tela estreita, nunca corta o número.
export const Fit = styled('div', {
  base: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    columnGap: '3',
    marginBlockStart: '4',
    textStyle: 'support',
    color: 'ink',
    fontVariantNumeric: 'tabular-nums',
  },
})

export const FitStrong = styled('b', {
  base: { fontWeight: '500' },
})

export const FitTotal = styled('span', {
  base: { color: 'ink.muted' },
})

export const BarWrap = styled('div', {
  base: { marginBlockStart: '2' },
})

export const Table = styled('table', {
  base: {
    width: '100%',
    borderCollapse: 'collapse',
    marginBlockStart: '4',
    textStyle: 'support',
    fontVariantNumeric: 'tabular-nums',
  },
})

export const Caption = styled('caption', {
  base: { textAlign: 'start', fontWeight: '500', color: 'ink', paddingBlockEnd: '2' },
})

export const Label = styled('th', {
  base: { textAlign: 'start', fontWeight: '400', color: 'ink.muted', paddingBlock: '1' },
})

export const Value = styled('td', {
  base: { textAlign: 'end', paddingBlock: '1', whiteSpace: 'nowrap', color: 'ink' },
})

// A última linha é a resposta da tabela: borda fina em cima e peso 600.
export const TotalLabel = styled('th', {
  base: {
    textAlign: 'start',
    textStyle: 'body',
    fontWeight: '600',
    color: 'ink',
    paddingBlockStart: '2',
    borderBlockStartWidth: '1px',
    borderBlockStartStyle: 'solid',
    borderBlockStartColor: 'line',
  },
})

export const TotalValue = styled('td', {
  base: {
    textAlign: 'end',
    textStyle: 'body',
    fontWeight: '600',
    color: 'ink',
    whiteSpace: 'nowrap',
    paddingBlockStart: '2',
    borderBlockStartWidth: '1px',
    borderBlockStartStyle: 'solid',
    borderBlockStartColor: 'line',
  },
})

export const WarningWrap = styled('div', {
  base: { marginBlockStart: '3' },
})

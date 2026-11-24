// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import { styled } from '@/styled-system/jsx'

export const Root = styled('div', {
  base: { display: 'flex', flexDirection: 'column', gap: '3', marginBlockStart: '4' },
})

// `div` e não `p`: o `Spinner` esconde um `div` para o leitor de tela, que não pode ficar dentro de um
// parágrafo.
export const Status = styled('div', {
  base: { display: 'flex', alignItems: 'center', gap: '2', textStyle: 'body', color: 'ink' },
})

export const Counts = styled('p', {
  base: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '2',
    textStyle: 'support',
    color: 'ink.muted',
    fontVariantNumeric: 'tabular-nums',
  },
})

export const Help = styled('p', {
  base: { textStyle: 'support', color: 'ink.muted' },
})

// "Cancelar download" é ação de saída: alinhada à esquerda, sem ocupar a largura toda.
export const Actions = styled('div', {
  base: { display: 'flex' },
})

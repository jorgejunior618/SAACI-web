// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import { styled } from '@/styled-system/jsx'

export const Page = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3',
    paddingInline: '4',
    paddingBlockStart: '1',
    paddingBlockEnd: '6',
  },
})

export const Hint = styled('p', {
  base: { margin: '0', textStyle: 'support', color: 'ink.muted' },
})

// Sem barra inferior nesta tela: o rodapé leva a área segura de baixo, como o do Registrar.
export const Footer = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2',
    paddingInline: '4',
    paddingBlockStart: '3',
    paddingBlockEnd: 'calc(token(spacing.4) + env(safe-area-inset-bottom))',
    background: 'surface',
    borderBlockStartWidth: '1px',
    borderBlockStartStyle: 'solid',
    borderBlockStartColor: 'line',
  },
})

export const Status = styled('p', {
  base: { margin: '0', textStyle: 'support', color: 'ink.muted', textAlign: 'center' },
})

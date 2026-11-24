// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import { styled } from '@/styled-system/jsx'

import { activityRow } from './recipe'

// Bloco base do esqueleto: trilho de progresso, raio `control` e o pulso do tema.
const block = {
  display: 'block',
  background: 'progress.track',
  borderRadius: 'control',
  animation: 'pulse 1.6s ease-in-out infinite',
} as const

export const Root = styled('li', activityRow)

export const Texts = styled('span', { base: { flex: '1', minWidth: '0' } })

export const Title = styled('span', { base: { ...block, width: '70%', height: '24px' } })

export const Meta = styled('span', {
  base: { ...block, width: '45%', height: '20px', marginBlockStart: '1' },
})

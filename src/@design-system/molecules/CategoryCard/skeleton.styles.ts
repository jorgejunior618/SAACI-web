// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import { styled } from '@/styled-system/jsx'

// Bloco base do esqueleto: trilho de progresso, raio `control` e o pulso do tema.
const block = {
  display: 'block',
  background: 'progress.track',
  borderRadius: 'control',
  animation: 'pulse 1.6s ease-in-out infinite',
} as const

export const ItemNumber = styled('span', { base: { ...block, width: '48px', height: '16px' } })

export const Name = styled('span', {
  base: { ...block, width: '80%', height: '24px', marginBlockStart: '1' },
})

export const Hours = styled('span', {
  base: { ...block, width: '96px', height: '26px', marginBlockStart: '3' },
})

export const Bar = styled('span', {
  base: { ...block, height: '4px', marginBlockStart: '2' },
})

export const Foot = styled('span', {
  base: { ...block, width: '50%', height: '20px', marginBlockStart: '2' },
})

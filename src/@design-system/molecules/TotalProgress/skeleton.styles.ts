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

// Alturas iguais às linhas reais (60px do número, 20px do support, 6px da barra), sem salto de layout.
export const Total = styled('span', {
  base: { ...block, width: '96px', height: '60px', marginBlockStart: '1' },
})

export const Label = styled('span', {
  base: { ...block, width: '60%', height: '20px', marginBlockStart: '1' },
})

export const Bar = styled('span', {
  base: { ...block, height: '6px', marginBlockStart: '4' },
})

export const Meta = styled('span', {
  base: { ...block, height: '20px', marginBlockStart: '2' },
})

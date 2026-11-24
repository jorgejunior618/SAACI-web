// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import { styled } from '@/styled-system/jsx'

// O `StateScreen` já traz o respiro de cima; o cartão do total fica 8px abaixo dele.
export const Page = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2',
    paddingInline: '4',
    paddingBlockEnd: '6',
  },
})

export const Actions = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2',
    paddingInline: '4',
    paddingBlockStart: '3',
    paddingBlockEnd: 'calc(token(spacing.4) + env(safe-area-inset-bottom))',
  },
})

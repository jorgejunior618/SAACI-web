// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import { styled } from '@/styled-system/jsx'

export const Root = styled('div', {
  base: { display: 'flex', flexDirection: 'column', gap: '2' },
})

export const Support = styled('p', {
  base: { margin: '0', textStyle: 'support', color: 'ink.muted' },
})

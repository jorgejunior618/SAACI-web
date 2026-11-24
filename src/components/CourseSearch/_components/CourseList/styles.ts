// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import { styled } from '@/styled-system/jsx'

export const List = styled('ul', {
  base: { display: 'flex', flexDirection: 'column', gap: '2', margin: '0', padding: '0' },
})

export const Item = styled('li', {
  base: { listStyle: 'none' },
})

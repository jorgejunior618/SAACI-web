// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import { styled } from '@/styled-system/jsx'

// Dá largura ao palco para o `block` aparecer ocupando a linha.
export const Wrap = styled('div', {
  base: { display: 'flex', justifyContent: 'center', width: '100%', maxWidth: '24rem' },
})

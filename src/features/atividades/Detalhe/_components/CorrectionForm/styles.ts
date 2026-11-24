// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import { styled } from '@/styled-system/jsx'

export const Page = styled('form', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6',
    paddingInline: '4',
    paddingBlockStart: '1',
    paddingBlockEnd: '6',
  },
})

// "Trocar item" fica logo abaixo do cartão da regra, à direita.
export const RuleBlock = styled('div', {
  base: { display: 'flex', flexDirection: 'column', '& > :last-child': { alignSelf: 'flex-end' } },
})

export const ItemBlock = styled('div', {
  base: { display: 'flex', flexDirection: 'column', gap: '2' },
})

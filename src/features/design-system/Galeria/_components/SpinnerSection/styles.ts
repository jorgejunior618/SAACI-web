// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import { styled } from '@/styled-system/jsx'

export const Specimens = styled('div', {
  base: {
    display: 'grid',
    gap: '4',
    gridTemplateColumns: 'repeat(auto-fill, minmax(10rem, 1fr))',
  },
})

export const OnBrand = styled('span', {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '2',
    paddingInline: '4',
    minHeight: 'control',
    background: 'brand',
    color: 'brand.on',
    borderRadius: 'control',
    textStyle: 'bodyStrong',
  },
})

// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import { css } from '@/styled-system/css'
import { styled } from '@/styled-system/jsx'

import { mark, rule } from './recipe'

export const List = styled('ul', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2',
    margin: '0',
    padding: '0',
    listStyle: 'none',
  },
})

export const Rule = styled('li', rule)

export const Mark = styled('span', mark)

// Diz o estado a quem não vê a cor nem o ícone.
export const hidden = css({
  position: 'absolute',
  width: '1px',
  height: '1px',
  overflow: 'hidden',
  clipPath: 'inset(50%)',
  whiteSpace: 'nowrap',
})

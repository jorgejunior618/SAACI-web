// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import { cva } from '@/styled-system/css'

/**
 * Recuo do título no modo de seleção: 16px de respiro, 18px do checkbox e 12px de vão. É onde a
 * divisória começa. Quem põe uma linha própria na mesma lista (como "Marcar todos do item") alinha o
 * texto por aqui, para não copiar o número.
 */
export const ACTIVITY_ROW_SELECTION_INDENT = '46px'

export const activityRow = cva({
  base: {
    position: 'relative',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '3',
    paddingBlock: '3',
    paddingInlineStart: '4',
    paddingInlineEnd: '3',
    // Divisória com recuo: começa no texto, não na borda da lista.
    '&:not(:first-child)::before': {
      content: '""',
      position: 'absolute',
      top: '0',
      insetInlineStart: '4',
      insetInlineEnd: '0',
      borderBlockStartWidth: '1px',
      borderBlockStartStyle: 'solid',
      borderBlockStartColor: 'line',
    },
  },
  variants: {
    // Com checkbox, o recuo acompanha o título (16 de respiro + 18 do controle + 12 de vão). O
    // espaçamento passa para o rótulo (`SelectMain`), para a borda da linha também marcar.
    selectable: {
      true: {
        paddingBlock: '0',
        paddingInlineStart: '0',
        paddingInlineEnd: '0',
        '&:not(:first-child)::before': { insetInlineStart: ACTIVITY_ROW_SELECTION_INDENT },
      },
    },
  },
})

import { cva } from '@/styled-system/css'

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
        '&:not(:first-child)::before': { insetInlineStart: '46px' },
      },
    },
  },
})

import { cva } from '@/styled-system/css'

export const choice = cva({
  base: {
    position: 'relative',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '3',
    // A linha inteira é tocável, mesmo com o controle desenhado em 18px.
    minHeight: 'touch',
    paddingBlock: '3',
    paddingInline: '4',
    cursor: 'pointer',
    WebkitTapHighlightColor: 'transparent',
  },
  variants: {
    layout: {
      // Opção dentro da lista: divisória com recuo e fundo tingido quando marcada.
      row: {
        '&:not(:first-child)::before': {
          content: '""',
          position: 'absolute',
          top: '0',
          // 16px de padding + 18px do controle + 12px de espaço.
          insetInlineStart: '46px',
          insetInlineEnd: '0',
          borderTopWidth: '1px',
          borderTopStyle: 'solid',
          borderTopColor: 'line',
        },
        '&:has(input:checked)': { background: 'brand.soft' },
      },
      // Checkbox isolado: cartão próprio e sem fundo tingido.
      single: {
        background: 'surface',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: 'line',
        borderRadius: 'card',
      },
    },
  },
  defaultVariants: { layout: 'row' },
})

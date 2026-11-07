import { cva } from '@/styled-system/css'

export const input = cva({
  base: {
    width: '100%',
    minHeight: 'control',
    paddingInline: '3',
    // 16px evita o zoom automático do campo no iOS.
    textStyle: 'body',
    fontVariantNumeric: 'tabular-nums',
    color: 'ink',
    background: 'surface',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'line.strong',
    borderRadius: 'control',
    _placeholder: { color: 'ink.subtle' },
  },
  variants: {
    state: {
      normal: {},
      // Borda mais grossa sem mexer no layout: o 1px extra é sombra interna.
      error: { borderColor: 'danger', boxShadow: 'inset 0 0 0 1px token(colors.danger)' },
      read: { background: 'surface.muted' },
      // Tracejada para o campo vazio chamar a atenção sem parecer erro.
      unread: { borderColor: 'warning', borderStyle: 'dashed' },
    },
    // Abre espaço para o botão Mostrar/Ocultar sobre o campo.
    withAction: {
      true: { paddingInlineEnd: '84px' },
    },
    // 12px de respiro + 20px do ícone + 8px até o texto.
    withIcon: {
      true: { paddingInlineStart: '40px' },
    },
  },
  defaultVariants: { state: 'normal' },
})

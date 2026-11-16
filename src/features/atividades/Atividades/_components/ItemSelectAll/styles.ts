import { ACTIVITY_ROW_SELECTION_INDENT } from '@design-system'

import { styled } from '@/styled-system/jsx'

// Primeira linha do item no modo de seleção. O texto começa no recuo do título das atividades, que
// vem do próprio ActivityRow, para ler como parte da lista; as linhas de baixo trazem a divisória.
export const Root = styled('li', {
  base: { paddingInlineStart: ACTIVITY_ROW_SELECTION_INDENT, paddingInlineEnd: '3' },
})

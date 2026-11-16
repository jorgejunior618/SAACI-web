import { styled } from '@/styled-system/jsx'

// Primeira linha do item no modo de seleção. O texto começa no recuo do título das atividades (46px),
// para ler como parte da lista; as linhas de baixo trazem a divisória.
export const Root = styled('li', {
  base: { paddingInlineStart: '46px', paddingInlineEnd: '3' },
})

import { css } from '@/styled-system/css'

// O logo completo foi desenhado sobre branco, por isso a placa branca nos dois temas.
export const plate = css({
  display: 'grid',
  placeItems: 'center',
  alignSelf: 'center',
  paddingY: '3',
  paddingX: '4',
  borderRadius: 'card',
  background: '#ffffff',
})

import { styled } from '@/styled-system/jsx'

export const Specimens = styled('div', {
  base: {
    display: 'grid',
    gap: '4',
    gridTemplateColumns: 'repeat(auto-fill, minmax(20rem, 1fr))',
  },
})

// O Specimen centraliza o conteúdo; a barra precisa ocupar a largura inteira do quadro.
export const Frame = styled('div', {
  base: { width: '100%', maxWidth: 'content' },
})

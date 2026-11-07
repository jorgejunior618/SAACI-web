import { styled } from '@/styled-system/jsx'

// Dá largura ao palco para o `block` aparecer ocupando a linha.
export const Wrap = styled('div', {
  base: { display: 'flex', justifyContent: 'center', width: '100%', maxWidth: '24rem' },
})

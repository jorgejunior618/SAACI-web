import { styled } from '@/styled-system/jsx'

import { progressTrack } from './recipe'

export const Track = styled('div', progressTrack)

// A largura chega por `style` inline: é a exceção prevista em convencoes-codigo.md.
export const Fill = styled('div', {
  base: {
    height: '100%',
    maxWidth: '100%',
    borderRadius: 'inherit',
    background: 'progress',
  },
})

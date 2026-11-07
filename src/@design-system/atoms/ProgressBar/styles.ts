import { styled } from '@/styled-system/jsx'

// 4px é a medida do componente: `sizes` não tem escala numérica.
export const Track = styled('div', {
  base: {
    height: '4px',
    borderRadius: 'control',
    background: 'progress.track',
    overflow: 'hidden',
  },
})

// A largura chega por `style` inline: é a exceção prevista em convencoes-codigo.md.
export const Fill = styled('div', {
  base: {
    height: '100%',
    maxWidth: '100%',
    borderRadius: 'inherit',
    background: 'progress',
  },
})

import { styled } from '@/styled-system/jsx'

// Borda de 1px e nenhuma sombra: a única sombra do sistema é a do bottom sheet.
export const Root = styled('div', {
  base: {
    // Bloco mesmo quando `as="a"`: um `<a>` inline parte padding e borda entre as linhas.
    display: 'block',
    color: 'inherit',
    textDecoration: 'none',
    padding: '4',
    background: 'surface',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'line',
    borderRadius: 'card',
  },
})

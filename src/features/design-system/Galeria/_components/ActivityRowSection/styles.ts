import { styled } from '@/styled-system/jsx'

export const Specimens = styled('div', {
  base: { display: 'grid', gap: '4', gridTemplateColumns: 'repeat(auto-fill, minmax(20rem, 1fr))' },
})

// A lista com borda é da tela; a galeria imita a de Certificados.
export const List = styled('ul', {
  base: {
    width: '100%',
    listStyle: 'none',
    margin: '0',
    padding: '0',
    background: 'surface',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'line',
    borderRadius: 'card',
    overflow: 'hidden',
  },
})

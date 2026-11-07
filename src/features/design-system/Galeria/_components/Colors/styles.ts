import { styled } from '@/styled-system/jsx'

export const Groups = styled('div', {
  base: { display: 'flex', flexDirection: 'column', gap: '8' },
})

export const Group = styled('section', {
  base: { display: 'flex', flexDirection: 'column', gap: '3' },
})

export const GroupTitle = styled('h2', {
  base: { textStyle: 'title' },
})

export const Grid = styled('div', {
  base: {
    display: 'grid',
    gap: '4',
    gridTemplateColumns: 'repeat(auto-fill, minmax(12rem, 1fr))',
  },
})

export const Tile = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    background: 'surface',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'line',
    borderRadius: 'card',
    overflow: 'hidden',
  },
})

// Amostra grande, na cor do tema atual do sistema.
export const Swatch = styled('div', {
  base: {
    height: '8rem',
    borderBottomWidth: '1px',
    borderBottomStyle: 'solid',
    borderBottomColor: 'line',
  },
})

export const Info = styled('div', {
  base: { display: 'flex', flexDirection: 'column', gap: '2', padding: '3' },
})

export const Name = styled('span', {
  base: { textStyle: 'label', overflowWrap: 'anywhere' },
})

export const Modes = styled('div', {
  base: { display: 'flex', flexDirection: 'column', gap: '1' },
})

export const Mode = styled('div', {
  base: { display: 'flex', alignItems: 'center', gap: '2', minWidth: '0' },
})

// Valor fixo de cada tema, para comparar claro e escuro sem trocar o tema do sistema.
export const Chip = styled('span', {
  base: {
    flex: 'none',
    // width e height leem `sizes`, que não tem escala numérica: a galeria usa rem direto.
    width: '1.5rem',
    height: '1.5rem',
    borderRadius: 'control',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'line',
  },
})

export const Detail = styled('span', {
  base: {
    textStyle: 'caption',
    color: 'ink.muted',
    fontVariantNumeric: 'tabular-nums',
    overflowWrap: 'anywhere',
  },
})

import { styled } from '@/styled-system/jsx'

export const Root = styled('figure', {
  base: { display: 'flex', flexDirection: 'column', gap: '2', margin: '0', minWidth: '0' },
})

export const Stage = styled('div', {
  base: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '3',
    minHeight: '6rem',
    padding: '4',
    background: 'surface',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'line',
    borderRadius: 'card',
  },
  variants: {
    // Sem moldura própria, para um componente que já tem borda (Card) não parecer caixa dentro de caixa.
    plain: {
      true: { padding: '0', background: 'transparent', borderColor: 'transparent' },
    },
  },
})

export const Caption = styled('figcaption', {
  base: { textStyle: 'caption', color: 'ink.muted' },
})

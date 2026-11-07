import { styled } from '@/styled-system/jsx'

export const Specimens = styled('div', {
  base: {
    display: 'grid',
    gap: '4',
    gridTemplateColumns: 'repeat(auto-fill, minmax(20rem, 1fr))',
  },
})

// As barras são coladas na janela de rolagem do quadro, não na da galeria.
export const Window = styled('div', {
  base: { height: '28rem', overflowY: 'auto', width: '100%' },
})

export const Bar = styled('div', {
  base: {
    display: 'flex',
    alignItems: 'center',
    paddingInline: '4',
    textStyle: 'caption',
    color: 'ink.muted',
  },
  variants: {
    side: {
      top: { height: 'topbar', background: 'surface.sunken' },
      bottom: {
        height: 'bottomnav',
        background: 'surface',
        borderBlockStartWidth: '1px',
        borderBlockStartStyle: 'solid',
        borderBlockStartColor: 'line',
      },
    },
  },
})

export const Paragraph = styled('p', {
  base: { margin: '0', padding: '4', textStyle: 'body' },
})

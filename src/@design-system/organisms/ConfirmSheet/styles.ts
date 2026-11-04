import { css } from '@/styled-system/css'
import { styled } from '@/styled-system/jsx'

// <dialog> nativo: foco preso, camada de cima e Esc vêm do navegador.
export const dialog = css({
  position: 'fixed',
  inset: 'auto 0 0 0',
  width: '100%',
  maxWidth: 'content',
  maxHeight: '90dvh',
  margin: '0 auto',
  padding: '2 4 6',
  border: '0',
  borderRadius: 'card',
  borderBottomLeftRadius: '0',
  borderBottomRightRadius: '0',
  background: 'surface.raised',
  color: 'ink',
  boxShadow: 'overlay',
  overflowY: 'auto',
  _backdrop: { background: 'scrim' },
  '&[open]': { display: 'flex', flexDirection: 'column' },
})

export const Grip = styled('span', {
  base: {
    alignSelf: 'center',
    width: '36px',
    height: '4px',
    marginBottom: '4',
    borderRadius: 'control',
    background: 'line',
  },
})

export const Title = styled('h2', {
  base: { margin: '0', textStyle: 'title' },
})

export const Body = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2',
    marginTop: '2',
    textStyle: 'body',
    '& p': { margin: '0' },
  },
})

export const Actions = styled('div', {
  base: { display: 'flex', flexDirection: 'column', gap: '2', marginTop: '6' },
})

import { css } from '@/styled-system/css'
import { styled } from '@/styled-system/jsx'

// Ferramenta de desenvolvimento: não segue o design de propósito, para não ser confundida com o app.
export const trigger = css({
  position: 'fixed',
  left: '0',
  top: '40%',
  zIndex: '50',
  paddingY: '2',
  paddingX: '1',
  border: '1px dashed',
  borderColor: 'line.strong',
  borderLeftWidth: '0',
  borderRadius: '0 6px 6px 0',
  background: 'surface.muted',
  color: 'ink.muted',
  textStyle: 'caption',
  writingMode: 'vertical-rl',
  cursor: 'pointer',
  opacity: '0.7',
  _hover: { opacity: '1' },
})

export const Panel = styled('div', {
  base: {
    position: 'fixed',
    left: '2',
    top: '2',
    zIndex: '50',
    width: '280px',
    maxHeight: 'calc(100dvh - 16px)',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '2',
    padding: '3',
    border: '1px dashed',
    borderColor: 'line.strong',
    borderRadius: 'card',
    background: 'surface.raised',
    boxShadow: 'overlay',
    textStyle: 'support',
  },
})

export const Title = styled('p', {
  base: { margin: '0', textStyle: 'label' },
})

export const option = css({
  width: '100%',
  paddingY: '2',
  paddingX: '3',
  border: '1px solid',
  borderColor: 'line',
  borderRadius: 'control',
  background: 'surface',
  color: 'ink',
  textAlign: 'left',
  cursor: 'pointer',
  _hover: { background: 'surface.muted' },
})

export const Hint = styled('p', {
  base: { margin: '0', color: 'ink.muted' },
})

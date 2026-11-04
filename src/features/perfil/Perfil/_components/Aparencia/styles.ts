import { css } from '@/styled-system/css'
import { styled } from '@/styled-system/jsx'

export const Track = styled('fieldset', {
  base: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: '1',
    margin: '0',
    padding: '1',
    border: '0',
    borderRadius: '8px',
    background: 'surface.muted',
  },
})

export const option = css({
  position: 'relative',
  display: 'grid',
  placeItems: 'center',
  minHeight: '40px',
  borderRadius: 'control',
  textStyle: 'label',
  color: 'ink.muted',
  cursor: 'pointer',
  '&:has(input:checked)': {
    background: 'surface',
    color: 'ink',
    boxShadow: '0 0 0 1px token(colors.line)',
  },
  '&:has(input:focus-visible)': {
    outline: '2px solid',
    outlineColor: 'focus',
    outlineOffset: '2px',
  },
})

export const input = css({ position: 'absolute', opacity: '0', pointerEvents: 'none' })

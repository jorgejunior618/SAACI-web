import { css } from '@/styled-system/css'
import { styled } from '@/styled-system/jsx'

export const row = css({
  display: 'flex',
  alignItems: 'center',
  gap: '3',
  width: '100%',
  minHeight: '56px',
  padding: '4',
  border: '0',
  background: 'transparent',
  color: 'inherit',
  font: 'inherit',
  textAlign: 'left',
  textDecoration: 'none',
  '&:is(button)': { cursor: 'pointer' },
})

export const Label = styled('span', {
  base: { flex: '1', minWidth: '0' },
})

export const Value = styled('span', {
  base: {
    maxWidth: '60%',
    color: 'ink.muted',
    fontVariantNumeric: 'tabular-nums',
    textAlign: 'right',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
})

export const Chevron = styled('span', {
  base: { display: 'flex', color: 'ink.subtle' },
})

export const Form = styled('form', {
  base: { display: 'flex', flexDirection: 'column', gap: '3', padding: '4' },
})

export const Buttons = styled('div', {
  base: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2' },
})

export const Saved = styled('div', {
  base: { paddingX: '4', paddingBottom: '3', marginTop: '-2' },
})

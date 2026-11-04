import { css } from '@/styled-system/css'
import { styled } from '@/styled-system/jsx'

export const Group = styled('section', {
  base: { display: 'flex', flexDirection: 'column', gap: '2' },
})

export const GroupTitle = styled('h2', {
  base: { margin: '2 0 0 4px', textStyle: 'label', color: 'ink.muted' },
})

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
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
})

export const Sub = styled('span', {
  base: { display: 'block', textStyle: 'support', color: 'ink.muted' },
})

export const Go = styled('span', {
  base: {
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
    textStyle: 'label',
    color: 'brand.text',
  },
})

export const Chevron = styled('span', {
  base: { display: 'flex', color: 'ink.subtle' },
})

export const Help = styled('p', {
  base: { margin: '0 0 0 4px', textStyle: 'support', color: 'ink.muted' },
})

export const Danger = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2',
    marginTop: '2',
    paddingTop: '6',
    borderTopWidth: '1px',
    borderTopStyle: 'solid',
    borderTopColor: 'line',
  },
})

export const dangerButton = css({
  width: '100%',
  minHeight: '56px',
  padding: '4',
  background: 'surface',
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: 'line',
  borderRadius: 'card',
  color: 'danger',
  font: 'inherit',
  fontWeight: '500',
  textAlign: 'left',
  cursor: 'pointer',
})

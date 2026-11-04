import { css } from '@/styled-system/css'
import { styled } from '@/styled-system/jsx'

export const Fieldset = styled('fieldset', {
  base: { border: '0', margin: '0', padding: '0', minWidth: '0' },
})

export const Legend = styled('legend', {
  base: { padding: '0', marginBottom: '2', textStyle: 'label' },
})

export const List = styled('div', {
  base: {
    background: 'surface',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'line',
    borderRadius: 'card',
    overflow: 'hidden',
  },
})

export const option = css({
  position: 'relative',
  display: 'flex',
  alignItems: 'flex-start',
  gap: '3',
  minHeight: 'touch',
  paddingY: '3',
  paddingX: '4',
  cursor: 'pointer',
  '& + &::before': {
    content: '""',
    position: 'absolute',
    top: '0',
    left: '46px',
    right: '0',
    borderTopWidth: '1px',
    borderTopStyle: 'solid',
    borderTopColor: 'line',
  },
  '&:has(input:checked)': { background: 'brand.soft' },
})

export const radio = css({
  appearance: 'none',
  flex: 'none',
  width: '18px',
  height: '18px',
  margin: '3px 0 0',
  borderWidth: '1.5px',
  borderStyle: 'solid',
  borderColor: 'line.strong',
  borderRadius: 'full',
  background: 'surface',
  cursor: 'pointer',
  _checked: {
    borderColor: 'brand',
    boxShadow: 'inset 0 0 0 3.5px token(colors.surface), inset 0 0 0 9px token(colors.brand)',
  },
})

export const Text = styled('span', {
  base: { display: 'flex', flexDirection: 'column', gap: '2px' },
})

export const Description = styled('small', {
  base: { textStyle: 'support', color: 'ink.muted' },
})

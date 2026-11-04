import { css } from '@/styled-system/css'
import { styled } from '@/styled-system/jsx'

export const Field = styled('div', {
  base: { display: 'flex', flexDirection: 'column', gap: '2' },
})

export const LabelRow = styled('div', {
  base: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '3' },
})

export const Label = styled('label', {
  base: { textStyle: 'label', color: 'ink' },
})

export const optional = css({ fontWeight: '400', color: 'ink.muted' })

export const Flag = styled('span', {
  base: { textStyle: 'caption', fontWeight: '400', color: 'ink.muted', whiteSpace: 'nowrap' },
})

export const Hint = styled('div', {
  base: { margin: '-4px 0 0', textStyle: 'support', color: 'ink.muted' },
})

// Mensagem acima do campo, dizendo o que fazer.
export const ErrorText = styled('p', {
  base: { margin: '0', textStyle: 'label', color: 'danger' },
})

export const Unread = styled('p', {
  base: { margin: '0', textStyle: 'support', color: 'warning' },
})

export const InputWrap = styled('div', {
  base: { position: 'relative', display: 'flex', alignItems: 'center' },
})

export const input = css({
  width: '100%',
  minHeight: 'control',
  paddingX: '3',
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: 'line.strong',
  borderRadius: 'control',
  background: 'surface',
  color: 'ink',
  textStyle: 'body',
  fontVariantNumeric: 'tabular-nums',
  _placeholder: { color: 'ink.subtle' },
  _disabled: { background: 'surface.muted', color: 'ink.muted' },
  '&[data-read=true]': { background: 'surface.muted' },
  '&[data-unread=true]': { borderColor: 'warning', borderStyle: 'dashed' },
  '&[aria-invalid=true]': {
    borderColor: 'danger',
    boxShadow: 'inset 0 0 0 1px token(colors.danger)',
  },
  '&[data-has-action=true]': { paddingRight: '84px' },
  '&[data-has-icon=true]': { paddingLeft: '40px' },
})

export const action = css({
  position: 'absolute',
  right: '0',
  minHeight: 'touch',
  paddingX: '3',
  border: '0',
  background: 'none',
  color: 'brand.text',
  textStyle: 'label',
  cursor: 'pointer',
})

export const leadingIcon = css({
  position: 'absolute',
  left: '3',
  display: 'flex',
  color: 'ink.subtle',
  pointerEvents: 'none',
})

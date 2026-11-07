import { styled } from '@/styled-system/jsx'

import { input } from './recipe'

export const Root = styled('div', {
  base: { display: 'flex', flexDirection: 'column', gap: '2' },
})

export const LabelRow = styled('div', {
  base: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '3' },
})

export const Label = styled('label', {
  base: { textStyle: 'label', color: 'ink' },
})

export const Optional = styled('span', {
  base: { fontWeight: '400', color: 'ink.muted' },
})

// O recuo negativo cola a regra no rótulo: o rótulo pertence ao campo de baixo.
export const Hint = styled('p', {
  base: { textStyle: 'support', color: 'ink.muted', marginBlockStart: '-1' },
})

export const ErrorText = styled('p', {
  base: { textStyle: 'label', color: 'danger' },
})

export const Flag = styled('p', {
  base: { textStyle: 'caption', fontWeight: '400', color: 'ink.muted', whiteSpace: 'nowrap' },
})

export const UnreadFlag = styled('p', {
  base: { textStyle: 'support', color: 'warning' },
})

export const InputWrap = styled('div', {
  base: { position: 'relative', display: 'flex', alignItems: 'center' },
})

export const Input = styled('input', input)

export const Action = styled('button', {
  base: {
    position: 'absolute',
    insetInlineEnd: '0',
    minHeight: 'touch',
    paddingInline: '3',
    textStyle: 'label',
    color: 'brand.text',
    background: 'transparent',
    border: '0',
    cursor: 'pointer',
    WebkitTapHighlightColor: 'transparent',
  },
})

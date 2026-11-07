import { styled } from '@/styled-system/jsx'

export const Wrap = styled('div', {
  base: { display: 'flex', flexDirection: 'column', gap: '2', width: '100%' },
})

export const Caption = styled('span', {
  base: { textStyle: 'support', color: 'ink.muted', fontVariantNumeric: 'tabular-nums' },
})

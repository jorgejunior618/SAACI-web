import { cva } from '@/styled-system/css'
import { styled } from '@/styled-system/jsx'

export const number = cva({
  base: { display: 'block' },
  variants: {
    size: {
      hero: { textStyle: 'hero' },
      compact: { textStyle: 'title', fontWeight: '600' },
    },
    isDone: {
      true: { color: 'brand.text' },
    },
  },
})

export const Label = styled('p', {
  base: { margin: '1 0 0', textStyle: 'support', color: 'ink.muted' },
})

export const Inline = styled('div', {
  base: { display: 'flex', alignItems: 'baseline', gap: '2' },
})

export const Bar = styled('div', {
  base: { marginTop: '4' },
})

export const Meta = styled('div', {
  base: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '2',
    textStyle: 'support',
    color: 'ink.muted',
    fontVariantNumeric: 'tabular-nums',
  },
})

export const Extra = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4',
    marginTop: '3',
    textStyle: 'support',
    color: 'ink.muted',
    '& p': { margin: '0' },
  },
})

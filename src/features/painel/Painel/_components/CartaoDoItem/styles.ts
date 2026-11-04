import { css, cva } from '@/styled-system/css'
import { styled } from '@/styled-system/jsx'

export const card = css({
  display: 'block',
  padding: '4',
  background: 'surface',
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: 'line',
  borderRadius: 'card',
  color: 'inherit',
  textDecoration: 'none',
})

export const Head = styled('span', {
  base: { display: 'flex', alignItems: 'flex-start', gap: '2' },
})

export const Titles = styled('span', {
  base: { flex: '1', minWidth: '0' },
})

export const Number = styled('span', {
  base: {
    display: 'block',
    textStyle: 'caption',
    color: 'ink.muted',
    fontVariantNumeric: 'tabular-nums',
  },
})

export const Name = styled('span', {
  base: {
    marginTop: '2px',
    textStyle: 'bodyStrong',
    lineClamp: '2',
  },
})

export const Chevron = styled('span', {
  base: { display: 'flex', marginTop: '18px', color: 'ink.subtle' },
})

export const Hours = styled('span', {
  base: { display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '3' },
})

export const hoursValue = cva({
  base: { textStyle: 'title', fontVariantNumeric: 'tabular-nums' },
  variants: { isCheio: { true: { color: 'brand.text' } } },
})

export const HoursLimit = styled('span', {
  base: { textStyle: 'support', color: 'ink.muted', fontVariantNumeric: 'tabular-nums' },
})

export const Bar = styled('span', {
  base: { display: 'block', marginTop: '2' },
})

export const foot = cva({
  base: { display: 'block', marginTop: '2', textStyle: 'support', color: 'ink.muted' },
  variants: { isCheio: { true: { color: 'brand.text' } } },
})

import { css } from '@/styled-system/css'
import { styled } from '@/styled-system/jsx'

export const List = styled('ul', {
  base: {
    listStyle: 'none',
    margin: '0',
    padding: '0',
    background: 'surface',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'line',
    borderRadius: 'card',
    overflow: 'hidden',
    '& > li': { position: 'relative' },
    '& > li + li::before': {
      content: '""',
      position: 'absolute',
      top: '0',
      left: '52px',
      right: '0',
      borderTopWidth: '1px',
      borderTopStyle: 'solid',
      borderTopColor: 'line',
    },
  },
  variants: {
    isFlush: {
      true: { border: '0', borderRadius: '0', background: 'transparent' },
    },
  },
})

export const row = css({
  position: 'relative',
  display: 'grid',
  gridTemplateColumns: '24px 1fr',
  columnGap: '3',
  width: '100%',
  paddingY: '3',
  paddingX: '4',
  border: '0',
  background: 'transparent',
  color: 'inherit',
  textAlign: 'left',
  font: 'inherit',
  '&[aria-selected=true]': { background: 'brand.soft' },
  '&:is(button)': { cursor: 'pointer' },
})

export const Aside = styled('span', {
  base: {
    textStyle: 'support',
    lineHeight: '24px',
    color: 'ink.muted',
    fontVariantNumeric: 'tabular-nums',
    textAlign: 'right',
  },
})

export const Title = styled('span', {
  base: { display: 'block', textStyle: 'bodyStrong' },
})

export const Description = styled('span', {
  base: { display: 'block', marginTop: '2px', textStyle: 'support', color: 'ink.muted' },
})

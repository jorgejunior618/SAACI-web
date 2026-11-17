import { styled } from '@/styled-system/jsx'

import { mark } from './recipe'

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
  },
})

// A divisória começa no texto, a 52px da borda: 16px de respiro, 24px do círculo e 12px de vão.
export const Item = styled('li', {
  base: {
    position: 'relative',
    '&:not(:first-child)::before': {
      content: '""',
      position: 'absolute',
      insetBlockStart: '0',
      insetInlineStart: '52px',
      insetInlineEnd: '0',
      borderBlockStartWidth: '1px',
      borderBlockStartStyle: 'solid',
      borderBlockStartColor: 'line',
    },
  },
})

export const Row = styled('a', {
  base: {
    display: 'grid',
    gridTemplateColumns: '24px minmax(0, 1fr) auto',
    columnGap: '3',
    alignItems: 'center',
    minHeight: 'touch',
    paddingBlock: '3',
    paddingInlineStart: '4',
    paddingInlineEnd: '3',
    color: 'ink',
    textDecoration: 'none',
    // Para dentro: a lista corta o que passa da borda (`overflow: hidden`), e o anel sumiria.
    _focusVisible: { outline: '2px solid token(colors.focus)', outlineOffset: '-2px' },
  },
})

export const Mark = styled('span', mark)

export const Text = styled('span', {
  base: { display: 'flex', flexDirection: 'column', minWidth: '0' },
})

export const Title = styled('span', {
  base: { textStyle: 'bodyStrong', color: 'ink', overflowWrap: 'anywhere' },
})

export const Description = styled('span', {
  base: { textStyle: 'support', color: 'ink.muted' },
})

export const Action = styled('span', {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '1',
    textStyle: 'label',
    color: 'brand.text',
    whiteSpace: 'nowrap',
  },
})

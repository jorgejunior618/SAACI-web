import { css, cva } from '@/styled-system/css'
import { styled } from '@/styled-system/jsx'

export const Summary = styled('span', {
  base: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) auto',
    columnGap: '3',
    alignItems: 'end',
  },
})

export const Number = styled('span', {
  base: { display: 'block', textStyle: 'caption', color: 'ink.muted' },
})

export const Name = styled('span', {
  base: {
    display: 'block',
    textStyle: 'bodyStrong',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
})

export const Hours = styled('span', {
  base: {
    textStyle: 'support',
    color: 'ink.muted',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
})

export const List = styled('ul', {
  base: {
    listStyle: 'none',
    margin: '0',
    padding: '0',
    borderTopWidth: '1px',
    borderTopStyle: 'solid',
    borderTopColor: 'line',
    '& > li': { position: 'relative' },
    '& > li + li::before': {
      content: '""',
      position: 'absolute',
      top: '0',
      left: 'var(--divider-inset, 16px)',
      right: '0',
      borderTopWidth: '1px',
      borderTopStyle: 'solid',
      borderTopColor: 'line',
    },
  },
  variants: {
    isSelecting: { true: { '--divider-inset': '46px' } },
  },
})

export const Row = styled('div', {
  base: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '3',
    paddingY: '3',
    paddingLeft: '4',
    paddingRight: '3',
  },
})

export const rowLink = css({ flex: '1', minWidth: '0', color: 'inherit', textDecoration: 'none' })

export const label = css({ flex: '1', minWidth: '0', cursor: 'pointer' })

export const ActName = styled('span', {
  base: {
    display: 'block',
    textStyle: 'bodyStrong',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
})

export const meta = cva({
  base: {
    display: 'block',
    marginTop: '2px',
    textStyle: 'support',
    color: 'ink.muted',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  variants: {
    status: {
      conta: {},
      parcial: { color: 'warning' },
      nao_conta: { color: 'danger' },
    },
  },
})

export const Chevron = styled('span', {
  base: { display: 'flex', marginTop: '2px', color: 'ink.subtle' },
})

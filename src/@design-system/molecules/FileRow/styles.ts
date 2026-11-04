import { styled } from '@/styled-system/jsx'

export const Row = styled('div', {
  base: {
    display: 'flex',
    alignItems: 'center',
    gap: '3',
    paddingY: '3',
    paddingLeft: '4',
    paddingRight: '2',
    color: 'ink.muted',
  },
})

export const Main = styled('div', {
  base: { flex: '1', minWidth: '0', display: 'flex', flexDirection: 'column' },
})

export const Name = styled('span', {
  base: {
    textStyle: 'bodyStrong',
    color: 'ink',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
})

export const Size = styled('span', {
  base: { textStyle: 'support', color: 'ink.muted', fontVariantNumeric: 'tabular-nums' },
})

export const Actions = styled('div', {
  base: { display: 'flex', flex: 'none' },
})

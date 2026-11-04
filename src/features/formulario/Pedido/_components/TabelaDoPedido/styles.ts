import { cva } from '@/styled-system/css'

export const row = cva({
  base: {
    display: 'grid',
    gridTemplateColumns: '24px minmax(0, 1fr) auto',
    columnGap: '3',
    paddingY: '10px',
    paddingX: '4',
    textStyle: 'support',
    fontVariantNumeric: 'tabular-nums',
    '& > :first-child': { textAlign: 'right' },
    '& > :nth-child(2)': { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
    '& > :last-child': { textAlign: 'right', fontWeight: '600' },
  },
  variants: {
    kind: {
      head: { color: 'ink.muted', '& > :last-child': { fontWeight: '400' } },
      body: {},
      muted: { color: 'ink.muted', '& > :last-child': { fontWeight: '400' } },
      total: { textStyle: 'bodyStrong', fontWeight: '600' },
    },
  },
})

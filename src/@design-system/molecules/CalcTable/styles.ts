import { css } from '@/styled-system/css'

export const table = css({
  width: '100%',
  borderCollapse: 'collapse',
  textStyle: 'support',
  fontVariantNumeric: 'tabular-nums',
  '& caption': {
    textAlign: 'left',
    fontWeight: '500',
    color: 'ink',
    paddingBottom: '2',
  },
  '& th': { textAlign: 'left', fontWeight: '400', color: 'ink.muted', paddingY: '1' },
  '& td': { textAlign: 'right', paddingY: '1', whiteSpace: 'nowrap', paddingLeft: '3' },
  '& tfoot th, & tfoot td': {
    borderTopWidth: '1px',
    borderTopStyle: 'solid',
    borderTopColor: 'line',
    paddingTop: '2',
    color: 'ink',
    textStyle: 'bodyStrong',
    fontWeight: '600',
  },
})

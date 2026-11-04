import { css } from '@/styled-system/css'

export const details = css({
  background: 'surface',
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: 'line',
  borderRadius: 'card',
  '& > summary': {
    listStyle: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '2',
    minHeight: 'touch',
    paddingY: '3',
    paddingX: '4',
    cursor: 'pointer',
    borderRadius: 'card',
  },
  '& > summary::-webkit-details-marker': { display: 'none' },
  '& > summary [data-chevron]': {
    display: 'flex',
    marginLeft: 'auto',
    color: 'ink.subtle',
    transition: 'transform token(durations.fast)',
  },
  '&[open] > summary [data-chevron]': { transform: 'rotate(180deg)' },
})

export const summaryContent = css({ flex: '1', minWidth: '0' })

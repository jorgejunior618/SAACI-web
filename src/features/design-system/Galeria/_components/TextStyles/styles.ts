import type { textStyles } from '@design-system/tokens'

import { css } from '@/styled-system/css'
import { styled } from '@/styled-system/jsx'

export const List = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    background: 'surface',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'line',
    borderRadius: 'card',
  },
})

export const Row = styled('div', {
  base: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: '2',
    padding: '4',
    '&:not(:last-child)': {
      borderBottomWidth: '1px',
      borderBottomStyle: 'solid',
      borderBottomColor: 'line',
    },
  },
})

export const Name = styled('span', {
  base: { textStyle: 'label', color: 'ink.muted' },
})

export const Detail = styled('span', {
  base: { textStyle: 'caption', color: 'ink.muted', fontVariantNumeric: 'tabular-nums' },
})

/** Uma classe por `textStyle`, escritas por extenso para o Panda extrair cada uma em build. */
export const textSamples: Record<keyof typeof textStyles, string> = {
  display: css({ textStyle: 'display' }),
  title: css({ textStyle: 'title' }),
  body: css({ textStyle: 'body' }),
  bodyStrong: css({ textStyle: 'bodyStrong' }),
  support: css({ textStyle: 'support' }),
  label: css({ textStyle: 'label' }),
  caption: css({ textStyle: 'caption' }),
}

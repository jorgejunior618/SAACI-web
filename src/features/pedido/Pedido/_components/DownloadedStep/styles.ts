import { styled } from '@/styled-system/jsx'

export const Page = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6',
    paddingInline: '4',
    paddingBlock: '4',
  },
})

export const FileRow = styled('div', {
  base: { display: 'flex', alignItems: 'center', gap: '3', color: 'ink.muted' },
})

export const FileMain = styled('span', {
  base: { display: 'flex', flexDirection: 'column', flex: '1', minWidth: '0' },
})

export const FileName = styled('span', {
  base: {
    textStyle: 'bodyStrong',
    color: 'ink',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
})

export const FileSize = styled('span', {
  base: { textStyle: 'support', color: 'ink.muted', fontVariantNumeric: 'tabular-nums' },
})

export const Next = styled('section', {
  base: { display: 'flex', flexDirection: 'column', gap: '4' },
})

export const NextHeader = styled('div', {
  base: { display: 'flex', flexDirection: 'column' },
})

export const NextLabel = styled('span', {
  base: { textStyle: 'caption', color: 'ink.muted' },
})

export const NextTitle = styled('h3', {
  base: { margin: '0', textStyle: 'bodyStrong', color: 'ink' },
})

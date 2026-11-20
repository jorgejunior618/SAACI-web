import { styled } from '@/styled-system/jsx'

export const Row = styled('div', {
  base: { display: 'flex', alignItems: 'center', gap: '3' },
})

export const FileIcon = styled('span', {
  base: { display: 'inline-flex', color: 'ink.muted', flexShrink: '0' },
})

// O nome longo corta com reticências; o tamanho fica embaixo, em cinza.
export const File = styled('div', {
  base: { display: 'flex', flexDirection: 'column', minWidth: '0', flex: '1' },
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
  base: { textStyle: 'support', color: 'ink.muted' },
})

export const Actions = styled('div', {
  base: { display: 'flex', gap: '4', flexShrink: '0' },
})

export const ErrorWrap = styled('div', {
  base: { marginBlockStart: '2' },
})

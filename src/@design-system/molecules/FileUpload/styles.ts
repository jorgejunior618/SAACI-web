import { styled } from '@/styled-system/jsx'

export const Root = styled('div', {
  base: { display: 'flex', flexDirection: 'column', gap: '2' },
})

export const Label = styled('span', {
  base: { textStyle: 'label', color: 'ink' },
})

// O recuo negativo cola a regra no rótulo: o rótulo pertence ao bloco de baixo.
export const Hint = styled('p', {
  base: { textStyle: 'support', color: 'ink.muted', marginBlockStart: '-1' },
})

export const Dropzone = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3',
    padding: '4',
    background: 'surface',
    borderWidth: '1px',
    borderStyle: 'dashed',
    borderColor: 'line.strong',
    borderRadius: 'card',
  },
})

// Empilhados: a foto é o caminho principal no celular, o arquivo vem logo abaixo.
export const Actions = styled('div', {
  base: { display: 'flex', flexDirection: 'column', gap: '3' },
})

export const Support = styled('p', {
  base: { textStyle: 'support', color: 'ink.muted' },
})

export const FileRow = styled('div', {
  base: { display: 'flex', alignItems: 'center', gap: '3' },
})

export const FileIcon = styled('span', {
  base: { display: 'inline-flex', color: 'ink.muted' },
})

// `minWidth: 0` deixa o nome encolher e virar reticências em vez de empurrar o botão.
export const FileMain = styled('span', {
  base: { flex: '1', minWidth: '0', display: 'flex', flexDirection: 'column' },
})

export const FileName = styled('span', {
  base: {
    textStyle: 'bodyStrong',
    color: 'ink',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
})

export const FileSize = styled('span', {
  base: { textStyle: 'support', color: 'ink.muted', fontVariantNumeric: 'tabular-nums' },
})

export const ErrorText = styled('p', {
  base: { textStyle: 'label', color: 'danger' },
})

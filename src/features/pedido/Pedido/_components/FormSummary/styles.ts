import { styled } from '@/styled-system/jsx'

export const Root = styled('section', {
  base: { display: 'flex', flexDirection: 'column', gap: '2' },
})

export const Heading = styled('h2', {
  base: { margin: '0', textStyle: 'label', color: 'ink' },
})

// Mesmo desenho do `Card` do design system, sem o respiro de 16px: a tabela leva o dela nas células.
export const TableBox = styled('div', {
  base: {
    background: 'surface',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'line',
    borderRadius: 'card',
    overflow: 'hidden',
  },
})

// `table-layout: fixed` deixa o nome da atividade cortar com reticências em vez de empurrar a tabela.
export const Table = styled('table', {
  base: {
    width: '100%',
    tableLayout: 'fixed',
    borderCollapse: 'collapse',
    textStyle: 'support',
    color: 'ink',
    fontVariantNumeric: 'tabular-nums',
  },
})

// Primeira coluna: 52px = 16px de respiro + 24px do número + 12px de vão, o mesmo recuo da lista de
// cima. Última coluna: 104px para caber "CH Solicitada". Nenhuma das duas tem token. A divisória só
// cobre da segunda coluna em diante, como no desenho.
const cell = {
  paddingBlock: '3',
  paddingInline: '0',
  textAlign: 'start',
  '&:first-child': {
    width: '52px',
    paddingInlineStart: '4',
    paddingInlineEnd: '3',
    textAlign: 'end',
    color: 'ink.muted',
  },
  '&:nth-child(2)': { paddingInlineEnd: '3' },
  '&:last-child': { width: '104px', paddingInlineEnd: '4', textAlign: 'end', whiteSpace: 'nowrap' },
} as const

const divided = {
  '&:not(:first-child)': {
    borderBlockEndWidth: '1px',
    borderBlockEndStyle: 'solid',
    borderBlockEndColor: 'line',
  },
} as const

export const HeadCell = styled('th', {
  base: { ...cell, ...divided, color: 'ink.muted', fontWeight: '400' },
})

export const Cell = styled('td', { base: { ...cell, ...divided } })

export const NameCell = styled('td', {
  base: { ...cell, ...divided, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
})

export const HoursCell = styled('td', {
  base: { ...cell, ...divided, fontWeight: '500' },
})

export const NoteCell = styled('td', {
  base: { ...cell, ...divided, color: 'ink.muted' },
})

export const TotalCell = styled('td', {
  base: { ...cell, textStyle: 'bodyStrong', fontWeight: '600' },
})

export const Note = styled('p', {
  base: { margin: '0', textStyle: 'support', color: 'ink.muted' },
})

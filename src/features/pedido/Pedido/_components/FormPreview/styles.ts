import { styled } from '@/styled-system/jsx'

// Exceção de design: a folha é papel e fica clara nos dois temas, como o PDF que sai. O design system
// não tem token de "papel" validado pela equipe, então os valores abaixo, os do protótipo, ficam
// locais de propósito. Se o design system ganhar tokens de papel, troque por eles.
const PAPER = '#ffffff'
const PAPER_INK = '#1f1d18'
const PAPER_MUTED = '#635d51'
const PAPER_LINE = '#c9c1b2'

// Raio de 4px e respiro de 14px são do desenho da folha, sem token.
export const Sheet = styled('article', {
  base: {
    background: PAPER,
    color: PAPER_INK,
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'line',
    borderRadius: '4px',
    paddingBlock: '4',
    paddingInline: '14px',
  },
})

export const Header = styled('p', {
  base: { margin: '0', fontSize: '10px', lineHeight: '14px', color: PAPER_MUTED },
})

export const Title = styled('h2', {
  base: {
    margin: '0',
    marginBlockStart: '1',
    marginBlockEnd: '3',
    fontSize: '13px',
    lineHeight: '18px',
    fontWeight: '600',
  },
})

export const Fields = styled('div', {
  base: {
    display: 'grid',
    gridTemplateColumns: '64px 1fr',
    gap: '1 2',
    marginBlockEnd: '3',
    fontSize: '12px',
    lineHeight: '16px',
  },
})

export const FieldLabel = styled('span', {
  base: { color: PAPER_MUTED },
})

// A linha embaixo mostra onde o nome e a matrícula entram, mesmo vazios. A altura mínima segura o
// espaço do campo em branco.
export const FieldValue = styled('span', {
  base: {
    minHeight: '16px',
    fontWeight: '500',
    fontVariantNumeric: 'tabular-nums',
    borderBlockEndWidth: '1px',
    borderBlockEndStyle: 'solid',
    borderBlockEndColor: PAPER_LINE,
  },
})

export const Table = styled('table', {
  base: {
    width: '100%',
    tableLayout: 'fixed',
    borderCollapse: 'collapse',
    fontSize: '12px',
    lineHeight: '16px',
    fontVariantNumeric: 'tabular-nums',
  },
})

const cell = {
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: PAPER_LINE,
  paddingBlock: '1',
  paddingInline: '6px',
  textAlign: 'start',
  verticalAlign: 'top',
} as const

export const HeadCell = styled('th', {
  base: {
    ...cell,
    fontWeight: '600',
    '&:first-child': { width: '40px' },
    '&:last-child': { width: '76px' },
  },
})

export const NumberCell = styled('td', {
  base: { ...cell, textAlign: 'end', whiteSpace: 'nowrap' },
})

export const NameCell = styled('td', {
  base: { ...cell, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
})

export const HoursCell = styled('td', {
  base: { ...cell, textAlign: 'end', whiteSpace: 'nowrap' },
})

// Hora que conta vai em negrito, como no formulário em papel. O traço fica normal.
export const FilledHoursCell = styled('td', {
  base: { ...cell, textAlign: 'end', whiteSpace: 'nowrap', fontWeight: '600' },
})

export const TotalHead = styled('th', {
  base: { ...cell, fontWeight: '600', '&:last-child': { textAlign: 'end' } },
})

export const Stamp = styled('p', {
  base: {
    margin: '0',
    marginBlockStart: '10px',
    fontSize: '10px',
    lineHeight: '14px',
    color: PAPER_MUTED,
  },
})

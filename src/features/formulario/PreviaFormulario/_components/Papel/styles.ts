import { styled } from '@/styled-system/jsx'

// É a imagem do documento impresso: fica em papel branco e tinta escura nos dois temas.
// Por isso usa valores fixos em vez dos tokens de tema.
export const Paper = styled('article', {
  base: {
    padding: '4',
    background: '#ffffff',
    color: '#1f1d18',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'line',
    borderRadius: 'control',
    fontSize: '13px',
    lineHeight: '18px',
  },
})

export const Caption = styled('p', {
  base: { margin: '0', fontSize: '11px', lineHeight: '16px', color: '#635d51' },
})

export const Title = styled('h2', {
  base: { margin: '1 0 3', fontSize: '15px', lineHeight: '20px', fontWeight: '600' },
})

export const Field = styled('p', {
  base: {
    display: 'grid',
    gridTemplateColumns: '72px 1fr',
    margin: '0 0 1',
    '& > span:first-child': { color: '#635d51' },
    '& > span:last-child': {
      borderBottomWidth: '1px',
      borderBottomStyle: 'solid',
      borderBottomColor: '#8f8778',
      fontWeight: '500',
    },
  },
})

export const Table = styled('table', {
  base: {
    width: '100%',
    marginTop: '3',
    borderCollapse: 'collapse',
    tableLayout: 'fixed',
    fontVariantNumeric: 'tabular-nums',
    '& th, & td': {
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: '#8f8778',
      paddingY: '1',
      paddingX: '6px',
      textAlign: 'left',
      verticalAlign: 'top',
    },
    '& th': { fontWeight: '600' },
    '& td:first-child, & th:first-child': { width: '40px', textAlign: 'right' },
    '& td:nth-child(2)': { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
    '& td:last-child, & th:last-child': { width: '84px', textAlign: 'right' },
    '& td:last-child': { fontWeight: '600' },
    '& tfoot td': { fontWeight: '600' },
  },
})

export const Generated = styled('p', {
  base: { margin: '3 0 0', fontSize: '11px', lineHeight: '16px', color: '#635d51' },
})

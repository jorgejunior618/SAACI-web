import { styled } from '@/styled-system/jsx'

export const Page = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1',
    gap: '6',
    paddingInline: '4',
    paddingBlock: '4',
  },
})

export const Section = styled('section', {
  base: { display: 'flex', flexDirection: 'column', gap: '2' },
})

export const SectionTitle = styled('h2', {
  base: { margin: '0', textStyle: 'support', color: 'ink.muted' },
})

// Linha de dado que não se edita (o e-mail). Mesmo respiro das linhas editáveis.
export const FixedRow = styled('div', {
  base: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '3',
    minHeight: 'touch',
    paddingInline: '4',
    textStyle: 'body',
    color: 'ink',
  },
})

export const FixedValue = styled('span', {
  base: {
    minWidth: '0',
    color: 'ink.muted',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
})

// Um cartão só para as linhas: o `Card` tem 16px de respiro, e as divisórias precisam ir de ponta a
// ponta. Mesma borda e mesmo raio dele.
export const DataCard = styled('div', {
  base: {
    background: 'surface',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'line',
    borderRadius: 'card',
    overflow: 'hidden',
  },
})

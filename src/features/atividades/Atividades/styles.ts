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

export const Summary = styled('div', {
  base: { display: 'flex', flexDirection: 'column', gap: '1' },
})

export const Total = styled('p', {
  base: { display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', columnGap: '2' },
})

export const TotalNumber = styled('span', {
  base: { textStyle: 'display', color: 'ink', fontVariantNumeric: 'tabular-nums' },
})

export const TotalLabel = styled('span', {
  base: { textStyle: 'body', color: 'ink.muted' },
})

export const SummaryText = styled('p', {
  base: { textStyle: 'support', color: 'ink.muted' },
})

// Rodapé do cartão: linha em `line`, "Escolher quais" à esquerda e "Ver meu pedido" à direita.
export const SummaryFooter = styled('div', {
  base: {
    display: 'flex',
    gap: '2',
    marginBlockStart: '4',
    borderBlockStartWidth: '1px',
    borderBlockStartStyle: 'solid',
    borderBlockStartColor: 'line',
  },
})

// "Ver meu pedido" fica à direita mesmo quando "Escolher quais" não aparece.
export const FooterEnd = styled('div', {
  base: { display: 'flex', marginInlineStart: 'auto' },
})

export const LinkContent = styled('span', {
  base: { display: 'inline-flex', alignItems: 'center', gap: '1' },
})

export const Section = styled('section', {
  base: { display: 'flex', flexDirection: 'column', gap: '3' },
})

export const SectionHeader = styled('div', {
  base: { display: 'flex', flexDirection: 'column', gap: '1' },
})

export const SectionTitle = styled('h2', {
  base: { textStyle: 'title', color: 'ink' },
})

export const SectionHint = styled('p', {
  base: { textStyle: 'support', color: 'ink.muted' },
})

export const GroupList = styled('div', {
  base: { display: 'flex', flexDirection: 'column', gap: '2' },
})

export const SkeletonList = styled('ul', {
  base: {
    listStyle: 'none',
    margin: '0',
    padding: '0',
    background: 'surface',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'line',
    borderRadius: 'card',
  },
})

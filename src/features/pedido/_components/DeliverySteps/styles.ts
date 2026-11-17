import { styled } from '@/styled-system/jsx'

import { marker } from './recipe'

export const List = styled('ol', {
  base: { listStyle: 'none', margin: '0', padding: '0', display: 'flex', flexDirection: 'column' },
})

// A linha do roadmap sai de baixo do círculo (24px mais 4px de respiro) e desce até o próximo.
// Ela fica a 11px da borda, no meio do círculo, e tem 2px. Nenhuma das medidas tem token.
export const Step = styled('li', {
  base: {
    position: 'relative',
    display: 'grid',
    gridTemplateColumns: '24px minmax(0, 1fr)',
    columnGap: '3',
    paddingBlockEnd: '4',
    '&:last-child': { paddingBlockEnd: '0' },
    '&:not(:last-child)::before': {
      content: '""',
      position: 'absolute',
      insetBlockStart: '28px',
      insetBlockEnd: '4px',
      insetInlineStart: '11px',
      borderInlineStartWidth: '2px',
      borderInlineStartStyle: 'solid',
      borderInlineStartColor: 'line',
    },
  },
})

export const Marker = styled('span', marker)

export const Body = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2',
    minWidth: '0',
    paddingBlockStart: '2px',
  },
})

export const StepTitle = styled('p', {
  base: { margin: '0', textStyle: 'bodyStrong', color: 'ink' },
})

export const Detail = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3',
    textStyle: 'support',
    color: 'ink.muted',
  },
})

export const DetailText = styled('p', {
  base: { margin: '0' },
})

export const Address = styled('span', {
  base: { color: 'ink', fontWeight: '500', overflowWrap: 'anywhere' },
})

export const Actions = styled('div', {
  base: { display: 'flex', flexDirection: 'column', gap: '2' },
})

// Cada download do passo 1 é um bloco com a divisória em cima, para os dois não se misturarem.
export const Sub = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2',
    paddingBlockStart: '3',
    borderBlockStartWidth: '1px',
    borderBlockStartStyle: 'solid',
    borderBlockStartColor: 'line',
  },
})

export const SubHeader = styled('div', {
  base: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '2' },
})

export const SubTitle = styled('p', {
  base: { margin: '0', textStyle: 'label', color: 'ink' },
})

export const Done = styled('span', {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '1',
    textStyle: 'caption',
    color: 'brand.text',
  },
})

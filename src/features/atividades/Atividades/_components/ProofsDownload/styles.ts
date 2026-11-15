import { styled } from '@/styled-system/jsx'

export const Root = styled('div', {
  base: { display: 'flex', flexDirection: 'column', gap: '3', marginBlockStart: '4' },
})

export const Status = styled('p', {
  base: { display: 'flex', alignItems: 'center', gap: '2', textStyle: 'body', color: 'ink' },
})

export const Counts = styled('p', {
  base: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '2',
    textStyle: 'support',
    color: 'ink.muted',
    fontVariantNumeric: 'tabular-nums',
  },
})

export const Help = styled('p', {
  base: { textStyle: 'support', color: 'ink.muted' },
})

// "Cancelar download" é ação de saída: alinhada à esquerda, sem ocupar a largura toda.
export const Actions = styled('div', {
  base: { display: 'flex' },
})

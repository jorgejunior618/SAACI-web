import { styled } from '@/styled-system/jsx'

// Cada linha traz a divisória de cima, menos a primeira do cartão.
export const Root = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2',
    paddingInline: '4',
    borderBlockStartWidth: '1px',
    borderBlockStartStyle: 'solid',
    borderBlockStartColor: 'line',
  },
})

export const ReadRow = styled('button', {
  base: {
    display: 'flex',
    alignItems: 'center',
    gap: '3',
    minHeight: 'touch',
    width: '100%',
    padding: '0',
    background: 'transparent',
    border: 'none',
    textAlign: 'start',
    cursor: 'pointer',
    color: 'ink',
    // Para dentro: o cartão corta o que passa da borda (`overflow: hidden`), e o anel sumiria.
    _focusVisible: { outline: '2px solid token(colors.focus)', outlineOffset: '-2px' },
  },
})

export const Label = styled('span', {
  base: { flex: '1', textStyle: 'body', color: 'ink' },
})

export const Value = styled('span', {
  base: {
    textStyle: 'body',
    color: 'ink.muted',
    fontVariantNumeric: 'tabular-nums',
    overflowWrap: 'anywhere',
  },
})

export const Chevron = styled('span', {
  base: { display: 'flex', color: 'ink.subtle' },
})

export const Form = styled('form', {
  base: { display: 'flex', flexDirection: 'column', gap: '4', paddingBlock: '4' },
})

export const Actions = styled('div', {
  base: { display: 'flex', gap: '3', '& > *': { flex: '1' } },
})

export const Feedback = styled('div', {
  base: { paddingBlockEnd: '3' },
})

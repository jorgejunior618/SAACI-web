import { styled } from '@/styled-system/jsx'

import { headline } from './recipe'

export const Page = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6',
    paddingInline: '4',
    paddingBlockStart: '1',
    paddingBlockEnd: '6',
  },
})

export const Header = styled('div', {
  base: { display: 'flex', flexDirection: 'column', gap: '1' },
})

export const Headline = styled('h2', headline)

export const Lead = styled('p', {
  base: { margin: '0', textStyle: 'support', color: 'ink.muted' },
})

// Rodapé de ação fixo acima da barra inferior. A área segura de baixo é da barra inferior.
export const Footer = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1',
    paddingInline: '4',
    paddingBlockStart: '3',
    paddingBlockEnd: '4',
    background: 'surface',
    borderBlockStartWidth: '1px',
    borderBlockStartStyle: 'solid',
    borderBlockStartColor: 'line',
  },
})

export const FooterHint = styled('p', {
  base: { margin: '0', textStyle: 'support', color: 'ink.muted', textAlign: 'center' },
})

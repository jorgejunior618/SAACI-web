import { styled } from '@/styled-system/jsx'

import { stateArt } from './recipe'

export const Root = styled('section', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    paddingBlock: '8',
    paddingInline: '4',
  },
})

export const Art = styled('span', stateArt)

// Número em destaque ("+10h"): o `display` com os 56px/60px do desenho, as mesmas medidas sem token
// do `TotalProgress`. Os 8px de baixo separam do título. Sem movimento, o número só aparece.
export const Highlight = styled('span', {
  base: {
    display: 'block',
    marginBlockEnd: '2',
    textStyle: 'display',
    fontSize: '56px',
    lineHeight: '60px',
    letterSpacing: '-1.6px',
    color: 'brand.text',
    // 500ms é a medida do desenho: `durations` só tem `fast` (200ms).
    animationName: 'popIn',
    animationDuration: '500ms',
    animationTimingFunction: 'out',
    animationFillMode: 'both',
    _motionReduce: { animationName: 'none' },
  },
})

// Selo curto acima do título ("Em construção"), no tom da marca.
export const Eyebrow = styled('span', {
  base: { marginBlockEnd: '1', textStyle: 'caption', color: 'brand.text' },
})

export const Title = styled('h2', {
  base: { margin: '0', textStyle: 'title' },
})

export const Description = styled('p', {
  base: {
    margin: '0',
    marginBlockStart: '2',
    maxWidth: '300px',
    textStyle: 'support',
    color: 'ink.muted',
  },
})

export const Label = styled('p', {
  base: { margin: '0', textStyle: 'support', color: 'ink.muted' },
})

export const Actions = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2',
    width: '100%',
    maxWidth: '340px',
    marginBlockStart: '6',
  },
})

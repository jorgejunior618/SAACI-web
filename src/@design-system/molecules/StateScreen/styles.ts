import { css } from '@/styled-system/css'
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

// 56px é o tamanho do símbolo no estado vazio; `sizes` não tem escala numérica.
export const symbol = css({ display: 'block', width: '56px', height: '56px' })

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

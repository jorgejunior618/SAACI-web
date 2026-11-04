import { css } from '@/styled-system/css'
import { styled } from '@/styled-system/jsx'

export const Box = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3',
    padding: '4',
    background: 'surface',
    borderWidth: '1px',
    borderStyle: 'dashed',
    borderColor: 'line.strong',
    borderRadius: 'card',
  },
})

export const Privacy = styled('p', {
  base: { margin: '0', textStyle: 'support', color: 'ink.muted' },
})

export const hidden = css({ srOnly: true })

import { css } from '@/styled-system/css'
import { styled } from '@/styled-system/jsx'

import { logo, root } from './recipe'

export const Root = styled('header', root)

export const Logo = styled('div', logo)

// Alvo de 48px. O recuo negativo alinha o ícone de 20px à margem da tela.
export const back = css({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 'touch',
  height: 'touch',
  marginInlineStart: '-3',
  marginBlockEnd: '2',
  color: 'ink',
})

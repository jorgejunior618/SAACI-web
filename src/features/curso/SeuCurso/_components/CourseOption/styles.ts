import { css } from '@/styled-system/css'
import { styled } from '@/styled-system/jsx'

// O cartão inteiro é o botão. Reseta o que o navegador põe em `button` e mantém o alvo de 48px.
export const card = css({
  display: 'flex',
  alignItems: 'center',
  gap: '3',
  width: '100%',
  minHeight: 'touch',
  textAlign: 'start',
  font: 'inherit',
  cursor: 'pointer',
})

export const Icon = styled('span', {
  base: { display: 'inline-flex', flexShrink: '0', color: 'ink.muted' },
})

export const Text = styled('span', {
  base: { display: 'flex', flexDirection: 'column', flex: '1', minWidth: '0' },
})

export const Name = styled('span', {
  base: { textStyle: 'bodyStrong', color: 'ink' },
})

export const Meta = styled('span', {
  base: { textStyle: 'support', color: 'ink.muted' },
})

export const Chevron = styled('span', {
  base: { display: 'inline-flex', flexShrink: '0', color: 'ink.subtle' },
})

import { css } from '@/styled-system/css'
import { styled } from '@/styled-system/jsx'

export const Section = styled('section', {
  base: { display: 'flex', flexDirection: 'column', gap: '2' },
})

export const SectionTitle = styled('h2', {
  base: { margin: '0', textStyle: 'label' },
})

export const row = css({
  display: 'flex',
  alignItems: 'center',
  gap: '3',
  width: '100%',
  padding: '4',
  border: '0',
  background: 'transparent',
  color: 'inherit',
  font: 'inherit',
  textAlign: 'left',
  textDecoration: 'none',
  cursor: 'pointer',
})

export const Text = styled('span', {
  base: { flex: '1', minWidth: '0', textStyle: 'bodyStrong' },
})

export const Sub = styled('span', {
  base: { display: 'block', fontWeight: '400', textStyle: 'support', color: 'ink.muted' },
})

export const Chevron = styled('span', {
  base: { display: 'flex', color: 'ink.subtle' },
})

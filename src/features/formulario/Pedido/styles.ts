import { cva } from '@/styled-system/css'
import { styled } from '@/styled-system/jsx'

export const Header = styled('div', {
  base: { display: 'flex', flexDirection: 'column', gap: '1' },
})

export const title = cva({
  base: { margin: '0', textStyle: 'display' },
  variants: { isPronto: { true: { color: 'brand.text' } } },
})

export const Lead = styled('p', {
  base: { margin: '0', textStyle: 'support', color: 'ink.muted' },
})

export const Section = styled('section', {
  base: { display: 'flex', flexDirection: 'column', gap: '2' },
})

export const SectionTitle = styled('h2', {
  base: { margin: '0', textStyle: 'bodyStrong' },
})

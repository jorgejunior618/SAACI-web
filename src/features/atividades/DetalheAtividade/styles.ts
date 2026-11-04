import { cva } from '@/styled-system/css'
import { styled } from '@/styled-system/jsx'

export const Header = styled('div', {
  base: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2' },
})

export const Title = styled('h2', {
  base: {
    margin: '0',
    fontSize: '22px',
    lineHeight: '28px',
    fontWeight: '600',
    letterSpacing: '-0.2px',
  },
})

export const Subtitle = styled('p', {
  base: { margin: '0', textStyle: 'support', color: 'ink.muted' },
})

export const Result = styled('div', {
  base: { display: 'flex', alignItems: 'baseline', gap: '2', flexWrap: 'wrap' },
})

export const number = cva({
  base: { textStyle: 'display' },
  variants: {
    status: {
      conta: { color: 'brand.text' },
      parcial: { color: 'warning' },
      nao_conta: { color: 'danger' },
    },
  },
})

export const ResultLabel = styled('span', {
  base: { textStyle: 'support', color: 'ink.muted' },
})

export const Why = styled('p', {
  base: { margin: '2 0 4' },
})

export const Section = styled('section', {
  base: { display: 'flex', flexDirection: 'column', gap: '2' },
})

export const SectionTitle = styled('h3', {
  base: { margin: '0', textStyle: 'bodyStrong' },
})

export const DataRow = styled('div', {
  base: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    gap: '4',
    paddingY: '3',
    paddingX: '4',
    textStyle: 'support',
    '& dt': { color: 'ink.muted' },
    '& dd': {
      margin: '0',
      fontWeight: '500',
      textAlign: 'right',
      fontVariantNumeric: 'tabular-nums',
    },
  },
})

export const Actions = styled('div', {
  base: { display: 'flex', flexDirection: 'column', gap: '2' },
})

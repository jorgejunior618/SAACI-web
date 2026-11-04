import { styled } from '@/styled-system/jsx'

export const Head = styled('div', {
  base: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '3' },
})

export const HeadText = styled('p', {
  base: { margin: '0', textStyle: 'label', color: 'brand.text' },
})

export const Text = styled('p', {
  base: { margin: '1 0 0' },
})

export const Fit = styled('div', {
  base: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    columnGap: '3',
    marginTop: '4',
    textStyle: 'support',
    fontVariantNumeric: 'tabular-nums',
    '& b': { fontWeight: '500' },
  },
})

export const Muted = styled('span', {
  base: { color: 'ink.muted' },
})

export const Bar = styled('div', {
  base: { marginTop: '2' },
})

export const Calc = styled('div', {
  base: { marginTop: '4' },
})

export const Warning = styled('div', {
  base: { marginTop: '3' },
})

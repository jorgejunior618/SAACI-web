import { css } from '@/styled-system/css'
import { styled } from '@/styled-system/jsx'

export const Section = styled('section', {
  base: { display: 'flex', flexDirection: 'column', gap: '2' },
})

// O ar fica em cima do título de seção, não embaixo.
export const SectionTitle = styled('h2', {
  base: { margin: '2 0 1', textStyle: 'title' },
})

export const Cards = styled('div', {
  base: { display: 'flex', flexDirection: 'column', gap: '2' },
})

export const disclosureTitle = css({ textStyle: 'bodyStrong' })

export const disclosureCount = css({
  marginLeft: '2',
  color: 'ink.muted',
  fontVariantNumeric: 'tabular-nums',
})

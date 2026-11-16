import { styled } from '@/styled-system/jsx'

export const Page = styled('form', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6',
    paddingInline: '4',
    paddingBlockStart: '1',
    paddingBlockEnd: '6',
  },
})

// "Trocar item" fica logo abaixo do cartão da regra, à direita.
export const RuleBlock = styled('div', {
  base: { display: 'flex', flexDirection: 'column', '& > :last-child': { alignSelf: 'flex-end' } },
})

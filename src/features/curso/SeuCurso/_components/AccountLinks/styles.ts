import { styled } from '@/styled-system/jsx'

export const Root = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1',
    marginBlockStart: 'auto',
  },
})

export const Row = styled('div', {
  base: { display: 'flex', justifyContent: 'center', gap: '6' },
})

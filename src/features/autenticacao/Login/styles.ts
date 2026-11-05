import { styled } from '@/styled-system/jsx'

export const Header = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4',
    paddingTop: '6',
  },
})

export const Tagline = styled('p', {
  base: {
    margin: '0',
    maxWidth: '300px',
    textAlign: 'center',
    textStyle: 'body',
    color: 'ink.muted',
  },
})

export const Form = styled('form', {
  base: { display: 'flex', flexDirection: 'column', gap: '6' },
})

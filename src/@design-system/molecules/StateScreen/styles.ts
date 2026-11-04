import { cva } from '@/styled-system/css'
import { styled } from '@/styled-system/jsx'

export const Wrapper = styled('section', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    paddingY: '8',
    paddingX: '4',
  },
})

export const icon = cva({
  base: {
    display: 'grid',
    placeItems: 'center',
    width: '56px',
    height: '56px',
    marginBottom: '4',
    borderRadius: 'full',
    background: 'surface',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'line',
    color: 'ink.muted',
  },
  variants: {
    tone: {
      neutral: {},
      brand: { color: 'brand.text' },
      danger: { color: 'danger' },
    },
  },
})

export const Caption = styled('p', {
  base: { margin: '0 0 4px', textStyle: 'caption', color: 'brand.text' },
})

export const Title = styled('h2', {
  base: { margin: '0', textStyle: 'title' },
})

export const Text = styled('div', {
  base: {
    marginTop: '2',
    maxWidth: '300px',
    textStyle: 'support',
    color: 'ink.muted',
    '& p': { margin: '0' },
    '& p + p': { marginTop: '2' },
  },
})

export const Actions = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2',
    width: '100%',
    maxWidth: '340px',
    marginTop: '6',
  },
})

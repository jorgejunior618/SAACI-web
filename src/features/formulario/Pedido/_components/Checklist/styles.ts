import { css } from '@/styled-system/css'
import { styled } from '@/styled-system/jsx'

export const row = css({
  display: 'grid',
  gridTemplateColumns: '24px minmax(0, 1fr) auto',
  columnGap: '3',
  alignItems: 'center',
  minHeight: 'touch',
  paddingY: '3',
  paddingLeft: '4',
  paddingRight: '3',
  color: 'inherit',
  textDecoration: 'none',
})

export const Ok = styled('span', {
  base: {
    display: 'grid',
    placeItems: 'center',
    width: '24px',
    height: '24px',
    borderRadius: 'full',
    background: 'brand',
    color: 'brand.on',
  },
})

export const Todo = styled('span', {
  base: {
    width: '24px',
    height: '24px',
    borderRadius: 'full',
    borderWidth: '1.5px',
    borderStyle: 'dashed',
    borderColor: 'warning',
  },
})

export const Title = styled('span', {
  base: { display: 'block', textStyle: 'bodyStrong' },
})

export const Sub = styled('span', {
  base: { display: 'block', textStyle: 'support', color: 'ink.muted' },
})

export const Go = styled('span', {
  base: {
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
    textStyle: 'label',
    color: 'brand.text',
    whiteSpace: 'nowrap',
  },
})

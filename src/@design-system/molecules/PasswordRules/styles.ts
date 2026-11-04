import { cva } from '@/styled-system/css'
import { styled } from '@/styled-system/jsx'

export const List = styled('ul', {
  base: {
    listStyle: 'none',
    margin: '0 0 4px',
    padding: '0',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
})

export const rule = cva({
  base: {
    display: 'flex',
    alignItems: 'center',
    gap: '2',
    textStyle: 'support',
  },
  variants: {
    isOk: {
      true: { color: 'brand.text' },
      false: { color: 'warning' },
    },
  },
})

export const mark = cva({
  base: {
    display: 'grid',
    placeItems: 'center',
    width: '16px',
    height: '16px',
    flex: 'none',
    borderRadius: 'full',
  },
  variants: {
    isOk: {
      true: { background: 'brand', color: 'brand.on' },
      false: { borderWidth: '1.5px', borderStyle: 'solid', borderColor: 'currentColor' },
    },
  },
})

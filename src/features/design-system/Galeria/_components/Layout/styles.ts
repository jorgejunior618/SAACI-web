import { styled } from '@/styled-system/jsx'

export const Group = styled('section', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3',
    padding: '4',
    background: 'surface',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'line',
    borderRadius: 'card',
  },
})

export const GroupTitle = styled('h2', {
  base: { textStyle: 'label', color: 'ink.muted' },
})

export const Row = styled('div', {
  base: { display: 'flex', alignItems: 'center', gap: '3', minWidth: '0' },
})

export const Detail = styled('span', {
  base: { textStyle: 'caption', color: 'ink.muted', fontVariantNumeric: 'tabular-nums' },
})

export const SpaceBar = styled('span', {
  base: { flex: 'none', height: '2', background: 'brand' },
})

export const RadiusBox = styled('span', {
  base: {
    flex: 'none',
    width: '8',
    height: '8',
    background: 'surface.muted',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'line.strong',
  },
})

export const SizeBar = styled('span', {
  base: { flex: 'none', height: '2', background: 'ink.subtle', maxWidth: '100%' },
})

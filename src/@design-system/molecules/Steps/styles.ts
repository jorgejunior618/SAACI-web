import { cva } from '@/styled-system/css'
import { styled } from '@/styled-system/jsx'

export const List = styled('ol', {
  base: { listStyle: 'none', margin: '0', padding: '0', display: 'flex', flexDirection: 'column' },
})

export const step = cva({
  base: { display: 'grid', columnGap: '14px' },
  variants: {
    size: {
      md: { gridTemplateColumns: '32px minmax(0, 1fr)' },
      sm: { gridTemplateColumns: '24px minmax(0, 1fr)', alignItems: 'start', paddingY: '1' },
    },
  },
})

export const Rail = styled('div', {
  base: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
})

export const dot = cva({
  base: {
    display: 'grid',
    placeItems: 'center',
    flexShrink: '0',
    borderRadius: 'full',
    borderWidth: '1.5px',
    borderStyle: 'solid',
    borderColor: 'line.strong',
    color: 'ink.muted',
    fontWeight: '600',
  },
  variants: {
    size: {
      md: {
        width: '32px',
        height: '32px',
        background: 'surface',
        textStyle: 'label',
        fontWeight: '600',
      },
      sm: {
        width: '24px',
        height: '24px',
        background: 'transparent',
        textStyle: 'caption',
        fontWeight: '600',
      },
    },
    isCurrent: {
      true: {
        background: 'brand',
        borderColor: 'brand',
        color: 'brand.on',
        animation: 'pulse 2.4s ease-out infinite',
      },
    },
  },
})

export const Line = styled('span', {
  base: { width: '2px', flexGrow: '1', marginY: '6px', borderRadius: '2px', background: 'line' },
})

export const Body = styled('div', {
  base: { paddingBottom: '6', minWidth: '0' },
})

export const Title = styled('p', {
  base: { margin: '4px 0 0', textStyle: 'bodyStrong' },
})

export const Description = styled('p', {
  base: { margin: '2px 0 0', textStyle: 'support', color: 'ink.muted' },
})

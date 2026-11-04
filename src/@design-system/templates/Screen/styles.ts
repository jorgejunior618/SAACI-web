import { styled } from '@/styled-system/jsx'

export const Wrapper = styled('div', {
  base: {
    flex: '1',
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    minHeight: '100%',
  },
})

export const Main = styled('main', {
  base: {
    flex: '1',
    display: 'flex',
    flexDirection: 'column',
    paddingTop: '1',
    paddingX: '4',
    paddingBottom: '8',
  },
  variants: {
    gap: {
      none: {},
      md: { gap: '6' },
    },
    isCentered: {
      true: { justifyContent: 'center' },
    },
    surface: {
      sunken: {},
      muted: { background: 'surface.muted' },
    },
  },
  defaultVariants: { gap: 'md' },
})

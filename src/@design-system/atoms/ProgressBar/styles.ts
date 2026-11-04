import { cva, css } from '@/styled-system/css'

export const track = cva({
  base: {
    display: 'block',
    borderRadius: 'control',
    background: 'progress.track',
    overflow: 'hidden',
  },
  variants: {
    size: {
      sm: { height: '4px' },
      lg: { height: '6px' },
    },
  },
  defaultVariants: { size: 'sm' },
})

export const fill = css({
  display: 'block',
  height: '100%',
  maxWidth: '100%',
  borderRadius: 'inherit',
  background: 'progress',
})

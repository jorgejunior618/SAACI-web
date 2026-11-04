import { cva } from '@/styled-system/css'

export const spinner = cva({
  base: {
    display: 'inline-block',
    flex: 'none',
    borderRadius: 'full',
    borderStyle: 'solid',
    borderColor: 'currentColor',
    borderRightColor: 'transparent',
    animation: 'spin 0.8s linear infinite',
  },
  variants: {
    size: {
      sm: { width: '16px', height: '16px', borderWidth: '2px' },
      // Único lugar de componente em que o redemoinho do logo aparece.
      lg: {
        width: '32px',
        height: '32px',
        borderWidth: '2.5px',
        borderColor: 'redemoinho',
        borderTopColor: 'brand',
        borderRightColor: 'redemoinho',
      },
    },
  },
  defaultVariants: { size: 'sm' },
})

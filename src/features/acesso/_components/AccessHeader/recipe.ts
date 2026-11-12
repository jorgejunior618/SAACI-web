import { cva } from '@/styled-system/css'

export const root = cva({
  base: { display: 'flex', flexDirection: 'column' },
  variants: {
    size: {
      lg: { alignItems: 'center' },
      sm: { alignItems: 'flex-start' },
    },
  },
})

// 216px e 144px são as larguras do desenho do logo, sem token na escala.
export const logo = cva({
  base: { display: 'block', maxWidth: '100%' },
  variants: {
    size: {
      lg: { width: '216px' },
      sm: { width: '144px' },
    },
  },
})

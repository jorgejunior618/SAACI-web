import { styled } from '@/styled-system/jsx'

// Lista agrupada num cartão, com divisória recuada entre as linhas.
export const GroupedList = styled('ul', {
  base: {
    listStyle: 'none',
    margin: '0',
    padding: '0',
    background: 'surface',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'line',
    borderRadius: 'card',
    overflow: 'hidden',
    '& > li': { position: 'relative' },
    '& > li + li::before': {
      content: '""',
      position: 'absolute',
      top: '0',
      left: 'var(--divider-inset, 16px)',
      right: '0',
      borderTopWidth: '1px',
      borderTopStyle: 'solid',
      borderTopColor: 'line',
    },
  },
  variants: {
    inset: {
      text: {},
      control: { '--divider-inset': '46px' },
      number: { '--divider-inset': '52px' },
    },
  },
  defaultVariants: { inset: 'text' },
})

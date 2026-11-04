import { css } from '@/styled-system/css'

export const checkbox = css({
  appearance: 'none',
  flex: 'none',
  display: 'grid',
  placeContent: 'center',
  width: '18px',
  height: '18px',
  margin: '3px 0 0',
  borderWidth: '1.5px',
  borderStyle: 'solid',
  borderColor: 'line.strong',
  borderRadius: '4px',
  background: 'surface',
  cursor: 'pointer',
  _checked: {
    background: 'brand',
    borderColor: 'brand',
    _after: {
      content: '""',
      width: '9px',
      height: '5px',
      borderStyle: 'solid',
      borderColor: 'brand.on',
      borderWidth: '0 0 2px 2px',
      transform: 'translateY(-1px) rotate(-45deg)',
    },
  },
})

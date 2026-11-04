import { css } from '@/styled-system/css'

export const iconButton = css({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '6px',
  minWidth: 'touch',
  height: 'touch',
  paddingX: '3',
  border: '0',
  borderRadius: 'control',
  background: 'none',
  color: 'ink',
  textStyle: 'label',
  textDecoration: 'none',
  cursor: 'pointer',
  _active: { background: 'surface.muted' },
})

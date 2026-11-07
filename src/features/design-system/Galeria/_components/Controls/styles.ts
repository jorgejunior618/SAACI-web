import { styled } from '@/styled-system/jsx'

export const Field = styled('label', {
  base: { display: 'flex', flexDirection: 'column', gap: '1', textStyle: 'label' },
})

export const Inline = styled('label', {
  base: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '3',
    minHeight: 'touch',
    textStyle: 'label',
  },
})

export const Select = styled('select', {
  base: {
    minHeight: 'touch',
    paddingInline: '3',
    background: 'surface',
    color: 'ink',
    textStyle: 'body',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'line.strong',
    borderRadius: 'control',
  },
})

export const Checkbox = styled('input', {
  base: { flex: 'none', width: '1.25rem', height: '1.25rem', accentColor: 'brand' },
})

export const Range = styled('input', {
  base: { width: '100%', accentColor: 'brand' },
})

export const Value = styled('span', {
  base: { color: 'ink.muted', fontVariantNumeric: 'tabular-nums' },
})

import { styled } from '@/styled-system/jsx'

export const Wrapper = styled('div', {
  base: { display: 'flex', alignItems: 'center', gap: '3', paddingX: '1' },
})

export const Avatar = styled('span', {
  base: {
    display: 'grid',
    placeItems: 'center',
    flex: 'none',
    width: '48px',
    height: '48px',
    borderRadius: 'full',
    background: 'surface',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'line',
    color: 'brand.text',
    fontWeight: '600',
  },
})

export const Text = styled('div', {
  base: { minWidth: '0', display: 'flex', flexDirection: 'column' },
})

export const Name = styled('p', {
  base: { margin: '0', textStyle: 'bodyStrong' },
})

export const Email = styled('p', {
  base: {
    margin: '0',
    textStyle: 'support',
    color: 'ink.muted',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
})

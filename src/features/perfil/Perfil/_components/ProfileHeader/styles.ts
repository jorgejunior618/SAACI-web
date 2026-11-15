import { styled } from '@/styled-system/jsx'

export const Root = styled('div', {
  base: { display: 'flex', alignItems: 'center', gap: '4' },
})

// Círculo de 48px, a mesma medida da ação Registrar (medida sem token).
export const Avatar = styled('span', {
  base: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: '0',
    width: '48px',
    height: '48px',
    background: 'surface',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'line',
    borderRadius: 'full',
    textStyle: 'bodyStrong',
    color: 'brand.text',
  },
})

export const Text = styled('div', {
  base: { display: 'flex', flexDirection: 'column', minWidth: '0' },
})

export const Name = styled('p', {
  base: { margin: '0', textStyle: 'title', color: 'ink', overflowWrap: 'anywhere' },
})

export const Email = styled('p', {
  base: { margin: '0', textStyle: 'support', color: 'ink.muted', overflowWrap: 'anywhere' },
})

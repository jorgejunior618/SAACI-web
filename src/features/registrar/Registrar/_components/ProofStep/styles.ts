import { styled } from '@/styled-system/jsx'

export const Root = styled('div', {
  base: { display: 'flex', flexDirection: 'column', gap: '3' },
})

export const Steps = styled('ol', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3',
    margin: '0',
    padding: '0',
    listStyle: 'none',
  },
})

export const Step = styled('li', {
  base: {
    display: 'grid',
    gridTemplateColumns: '24px minmax(0, 1fr)',
    columnGap: '3',
    alignItems: 'start',
  },
})

// 24px e a borda de 1,5px são o desenho do marcador do protótipo, sem token: `sizes` não tem escala
// numérica e o DS não tem token de espessura de borda.
export const Marker = styled('span', {
  base: {
    display: 'grid',
    placeItems: 'center',
    width: '24px',
    height: '24px',
    borderRadius: 'full',
    borderWidth: '1.5px',
    borderStyle: 'solid',
    borderColor: 'line.strong',
    textStyle: 'caption',
    fontWeight: '600',
    color: 'ink.muted',
  },
})

export const StepText = styled('p', {
  base: { margin: '0', textStyle: 'support', color: 'ink.muted' },
})

export const Support = styled('p', {
  base: { margin: '0', textStyle: 'support', color: 'ink.muted' },
})

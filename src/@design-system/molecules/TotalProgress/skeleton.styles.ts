import { styled } from '@/styled-system/jsx'

// Bloco base do esqueleto: trilho de progresso, raio `control` e o pulso do tema.
const block = {
  display: 'block',
  background: 'progress.track',
  borderRadius: 'control',
  animation: 'pulse 1.6s ease-in-out infinite',
} as const

// Alturas iguais às linhas de texto reais (36px do display, 20px do support), sem salto de layout.
export const Total = styled('span', { base: { ...block, width: '72px', height: '36px' } })

export const Label = styled('span', {
  base: { ...block, width: '60%', height: '20px', marginBlockStart: '1' },
})

export const Bar = styled('span', {
  base: { ...block, height: '4px', marginBlockStart: '4' },
})

export const Meta = styled('span', {
  base: { ...block, height: '20px', marginBlockStart: '2' },
})

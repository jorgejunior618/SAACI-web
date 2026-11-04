import type { ReactNode } from 'react'

import { styled } from '@/styled-system/jsx'

import { Spinner } from '../../atoms/Spinner'

const Text = styled('p', {
  base: {
    display: 'flex',
    alignItems: 'center',
    gap: '2',
    margin: '0',
    textStyle: 'support',
    color: 'ink.muted',
  },
})

// Espera com o tempo previsto escrito: "Lendo seu certificado, cerca de 20 segundos".
export function Status({ children }: { children: ReactNode }): ReactNode {
  return (
    <Text role="status">
      <Spinner />
      {children}
    </Text>
  )
}

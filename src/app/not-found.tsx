import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import { AppFrame } from '@design-system'

import { TelaNaoEncontrada } from '@/components/TelaNaoEncontrada'

export const metadata: Metadata = { title: 'Página não encontrada' }

export default function NotFound(): ReactNode {
  return (
    <AppFrame>
      <TelaNaoEncontrada
        title="Esta página não existe"
        text="O endereço pode ter mudado ou ter sido digitado errado."
        href="/"
        linkLabel="Ir para o início"
      />
    </AppFrame>
  )
}

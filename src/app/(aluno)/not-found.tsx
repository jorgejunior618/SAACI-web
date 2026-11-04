import type { ReactNode } from 'react'

import { TelaNaoEncontrada } from '@/components/TelaNaoEncontrada'
import { ROUTES } from '@/constants/routes'

export default function NotFound(): ReactNode {
  return (
    <TelaNaoEncontrada
      title="Esta página não existe"
      text="O endereço pode ter mudado ou ter sido digitado errado."
      href={ROUTES.painel}
      linkLabel="Voltar ao Início"
    />
  )
}

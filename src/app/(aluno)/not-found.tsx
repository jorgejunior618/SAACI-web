import type { ReactNode } from 'react'

import { NotFoundScreen } from '@/components/NotFoundScreen'

export default function NotFound(): ReactNode {
  return (
    <NotFoundScreen
      title="Esta página não existe"
      description="O endereço pode ter mudado ou estar digitado errado. Volte e continue de lá."
      backHref="/inicio"
      backLabel="Ir para o Início"
    />
  )
}

import type { ReactNode } from 'react'

import { NotFoundScreen } from '@/components/NotFoundScreen'

export default function NotFound(): ReactNode {
  return (
    <NotFoundScreen
      title="Não encontramos esta atividade"
      description="Ela pode ter sido removida. Volte para a lista e escolha outra."
      backHref="/atividades"
      backLabel="Voltar para Atividades"
    />
  )
}

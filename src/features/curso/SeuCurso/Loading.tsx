import type { ReactNode } from 'react'

import { AppFrame, LoadingState } from '@design-system'

/** Carregamento da tela Seu curso, enquanto a lista de cursos com regras chega. */
export function Loading(): ReactNode {
  return (
    <AppFrame>
      <LoadingState label="Buscando os cursos" />
    </AppFrame>
  )
}

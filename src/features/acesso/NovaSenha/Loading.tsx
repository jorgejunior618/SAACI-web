import type { ReactNode } from 'react'

import { AppFrame, LoadingState } from '@design-system'

/** Carregamento da tela Nova senha, enquanto o link é conferido. */
export function Loading(): ReactNode {
  return (
    <AppFrame>
      <LoadingState label="Conferindo o link" />
    </AppFrame>
  )
}

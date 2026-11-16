import NextLink from 'next/link'
import type { ReactNode } from 'react'

import { AppFrame, LoadingState, TopBar } from '@design-system'

/** Carregamento da tela Registrar atividade, com o Voltar já no lugar e sem a barra inferior. */
export function Loading(): ReactNode {
  return (
    <AppFrame
      topBar={
        <TopBar variant="inner" title="Registrar atividade" backHref="/inicio" linkAs={NextLink} />
      }
    >
      <LoadingState label="Buscando os itens do seu curso" />
    </AppFrame>
  )
}

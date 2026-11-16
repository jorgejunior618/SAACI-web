import NextLink from 'next/link'
import type { ReactNode } from 'react'

import { AppFrame, LoadingState, TopBar } from '@design-system'

import { MainNav } from '@/components/MainNav'

/** Carregamento da tela Trocar curso, com o Voltar e a barra de baixo já no lugar. */
export function Loading(): ReactNode {
  return (
    <AppFrame
      topBar={<TopBar variant="inner" title="Trocar curso" backHref="/perfil" linkAs={NextLink} />}
      bottomNav={<MainNav />}
    >
      <LoadingState label="Buscando seu curso" />
    </AppFrame>
  )
}

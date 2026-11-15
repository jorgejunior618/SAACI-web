import type { ReactNode } from 'react'

import { AppFrame, LoadingState, TopBar } from '@design-system'

import { MainNav } from '@/components/MainNav'

/** Carregamento da tela Perfil, com a barra de topo e a de baixo já no lugar. */
export function Loading(): ReactNode {
  return (
    <AppFrame topBar={<TopBar variant="root" title="Perfil" />} bottomNav={<MainNav />}>
      <LoadingState label="Buscando seu perfil" />
    </AppFrame>
  )
}

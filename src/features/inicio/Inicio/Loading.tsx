import type { ReactNode } from 'react'

import { AppFrame, CategoryCardSkeleton, TopBar, TotalProgressSkeleton } from '@design-system'

import { MainNav } from '@/components/MainNav'

import * as S from './styles'

/** Carregamento da tela Início, com a barra de topo e a de baixo já no lugar. */
export function Loading(): ReactNode {
  return (
    <AppFrame topBar={<TopBar variant="home" />} bottomNav={<MainNav />}>
      <S.Page role="status" aria-label="Buscando suas horas">
        <TotalProgressSkeleton />
        <S.CardList>
          <CategoryCardSkeleton />
          <CategoryCardSkeleton />
          <CategoryCardSkeleton />
        </S.CardList>
      </S.Page>
    </AppFrame>
  )
}

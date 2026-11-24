// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import type { ReactNode } from 'react'

import { ActivityRowSkeleton, AppFrame, TopBar, TotalProgressSkeleton } from '@design-system'

import { MainNav } from '@/components/MainNav'

import * as S from './styles'

/** Carregamento da tela Atividades, com a barra de topo e a de baixo já no lugar. */
export function Loading(): ReactNode {
  return (
    <AppFrame topBar={<TopBar variant="root" title="Atividades" />} bottomNav={<MainNav />}>
      <S.Page role="status" aria-label="Buscando suas atividades">
        <TotalProgressSkeleton />
        <S.SkeletonList>
          <ActivityRowSkeleton />
          <ActivityRowSkeleton />
          <ActivityRowSkeleton />
        </S.SkeletonList>
      </S.Page>
    </AppFrame>
  )
}

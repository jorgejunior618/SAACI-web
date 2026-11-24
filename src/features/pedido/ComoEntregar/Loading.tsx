// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import NextLink from 'next/link'
import type { ReactNode } from 'react'

import { AppFrame, LoadingState, TopBar } from '@design-system'

import { MainNav } from '@/components/MainNav'

/** Carregamento da tela Como entregar, com a barra de topo e a de baixo já no lugar. */
export function Loading(): ReactNode {
  return (
    <AppFrame
      topBar={
        <TopBar
          variant="inner"
          title="Como entregar"
          backHref="/atividades/pedido"
          linkAs={NextLink}
        />
      }
      bottomNav={<MainNav />}
    >
      <LoadingState label="Preparando o passo a passo" />
    </AppFrame>
  )
}

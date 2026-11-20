'use client'

import NextLink from 'next/link'
import type { ReactNode } from 'react'

import { AppFrame, LoadingState, TopBar } from '@design-system'

import { MainNav } from '@/components/MainNav'

/** Carregamento do Detalhe da atividade, com a barra de topo e a de baixo já no lugar. */
export function Loading(): ReactNode {
  return (
    <AppFrame
      topBar={<TopBar variant="inner" title="Atividade" backHref="/atividades" linkAs={NextLink} />}
      bottomNav={<MainNav />}
    >
      <LoadingState label="Buscando a atividade" />
    </AppFrame>
  )
}

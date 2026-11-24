// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import type { Metadata } from 'next'
import { Suspense } from 'react'
import type { ReactNode } from 'react'

import { PrefetchBoundary, prefetchCourseId } from '@/app/_prefetch/prefetch-boundary'
import type { PrefetchContext } from '@/app/_prefetch/prefetch-boundary'
import { Atividades } from '@/features/atividades/Atividades'
import { Loading } from '@/features/atividades/Atividades/Loading'
import { parseItemParam, parseRemovedParam } from '@/features/atividades/Atividades/utils'
import { activitiesQueries } from '@/services/activities'
import { progressQueries } from '@/services/progress'
import { rulesQueries } from '@/services/rules'

export const metadata: Metadata = { title: 'Atividades' }

type PageProps = {
  /** Parâmetros da URL: `item` abre um item de regra e `removida` leva o nome da atividade removida. */
  searchParams: Promise<{ item?: string | string[]; removida?: string | string[] }>
}

async function prefetch(context: PrefetchContext): Promise<void> {
  const { db, prefetchQuery } = context
  // Atividades e progresso não dependem do perfil, então saem junto. As regras dependem do curso.
  const [courseId] = await Promise.all([
    prefetchCourseId(context),
    prefetchQuery(activitiesQueries.list(db)),
    prefetchQuery(progressQueries.summary(db)),
  ])

  if (courseId) await prefetchQuery(rulesQueries.items(courseId, db))
}

/**
 * Rota `/atividades`: a lista de atividades do aluno e o total por item de regra.
 *
 * @remarks
 * Busca no servidor as atividades, o progresso, o perfil e os itens de regra do curso, e hidrata o
 * cache para a tela abrir já com o dado.
 *
 * @returns A tela dentro do `PrefetchBoundary`.
 */
export default async function Page({ searchParams }: PageProps): Promise<ReactNode> {
  const { item, removida } = await searchParams

  return (
    <PrefetchBoundary prefetch={prefetch}>
      <Suspense fallback={<Loading />}>
        <Atividades openItem={parseItemParam(item)} removedName={parseRemovedParam(removida)} />
      </Suspense>
    </PrefetchBoundary>
  )
}

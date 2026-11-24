// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import type { Metadata } from 'next'
import { Suspense } from 'react'
import type { ReactNode } from 'react'

import { PrefetchBoundary, prefetchCourseId } from '@/app/_prefetch/prefetch-boundary'
import type { PrefetchContext } from '@/app/_prefetch/prefetch-boundary'
import { Pedido } from '@/features/pedido/Pedido'
import { Loading } from '@/features/pedido/Pedido/Loading'
import { activitiesQueries } from '@/services/activities'
import { progressQueries } from '@/services/progress'
import { rulesQueries } from '@/services/rules'

export const metadata: Metadata = { title: 'Seu pedido' }

async function prefetch(context: PrefetchContext): Promise<void> {
  const { db, prefetchQuery } = context
  // Atividades e progresso não dependem do perfil. Curso e regras dependem do curso do perfil.
  const [courseId] = await Promise.all([
    prefetchCourseId(context),
    prefetchQuery(activitiesQueries.list(db)),
    prefetchQuery(progressQueries.summary(db)),
  ])

  if (courseId) {
    await Promise.all([
      prefetchQuery(rulesQueries.course(courseId, db)),
      prefetchQuery(rulesQueries.items(courseId, db)),
    ])
  }
}

/**
 * Rota `/atividades/pedido`: o pedido que o aluno entrega à coordenação, com a prévia do formulário.
 *
 * @remarks
 * Busca no servidor as atividades, o progresso, o perfil, o curso e os itens de regra, e hidrata o
 * cache para a tela abrir já com o dado.
 *
 * @returns A tela dentro do `PrefetchBoundary`.
 */
export default function Page(): ReactNode {
  return (
    <PrefetchBoundary prefetch={prefetch}>
      <Suspense fallback={<Loading />}>
        <Pedido />
      </Suspense>
    </PrefetchBoundary>
  )
}

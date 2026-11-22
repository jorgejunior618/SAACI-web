import type { Metadata } from 'next'
import { Suspense } from 'react'
import type { ReactNode } from 'react'

import { PrefetchBoundary, prefetchCourseId } from '@/app/_prefetch/prefetch-boundary'
import type { PrefetchContext } from '@/app/_prefetch/prefetch-boundary'
import { Detalhe } from '@/features/atividades/Detalhe'
import { Loading } from '@/features/atividades/Detalhe/Loading'
import { activitiesQueries } from '@/services/activities'
import { progressQueries } from '@/services/progress'
import { rulesQueries } from '@/services/rules'

export const metadata: Metadata = { title: 'Atividade' }

type PageProps = {
  /** Parâmetros da rota: `id` é o identificador da atividade. */
  params: Promise<{ id: string }>
}

/**
 * Rota `/atividades/[id]`: o detalhe de uma atividade, com correção e remoção.
 *
 * @remarks
 * Busca no servidor o detalhe, a lista, o progresso, o perfil e os itens de regra do curso. Uma
 * atividade que não existe chega como `null` e a tela chama `notFound()` (ADR 0013).
 *
 * @returns A tela dentro do `PrefetchBoundary`.
 */
export default async function Page({ params }: PageProps): Promise<ReactNode> {
  const { id } = await params

  async function prefetch(context: PrefetchContext): Promise<void> {
    const { db, prefetchQuery } = context
    // O detalhe, a lista e o progresso não dependem do perfil. As regras dependem do curso.
    const [courseId] = await Promise.all([
      prefetchCourseId(context),
      prefetchQuery(activitiesQueries.detail(id, db)),
      prefetchQuery(activitiesQueries.list(db)),
      prefetchQuery(progressQueries.summary(db)),
    ])

    if (courseId) await prefetchQuery(rulesQueries.items(courseId, db))
  }

  return (
    <PrefetchBoundary prefetch={prefetch}>
      <Suspense fallback={<Loading />}>
        <Detalhe id={id} />
      </Suspense>
    </PrefetchBoundary>
  )
}

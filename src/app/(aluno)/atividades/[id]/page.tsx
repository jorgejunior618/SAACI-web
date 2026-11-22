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
  params: Promise<{ id: string }>
}

export default async function Page({ params }: PageProps): Promise<ReactNode> {
  const { id } = await params

  async function prefetch(context: PrefetchContext): Promise<void> {
    const { db, queryClient } = context
    // O detalhe, a lista e o progresso não dependem do perfil. As regras dependem do curso.
    const [courseId] = await Promise.all([
      prefetchCourseId(context),
      queryClient.prefetchQuery(activitiesQueries.detail(id, db)),
      queryClient.prefetchQuery(activitiesQueries.list(db)),
      queryClient.prefetchQuery(progressQueries.summary(db)),
    ])

    if (courseId) await queryClient.prefetchQuery(rulesQueries.items(courseId, db))
  }

  return (
    <PrefetchBoundary prefetch={prefetch}>
      <Suspense fallback={<Loading />}>
        <Detalhe id={id} />
      </Suspense>
    </PrefetchBoundary>
  )
}

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
  const { db, queryClient } = context
  // Atividades e progresso não dependem do perfil. Curso e regras dependem do curso do perfil.
  const [courseId] = await Promise.all([
    prefetchCourseId(context),
    queryClient.prefetchQuery(activitiesQueries.list(db)),
    queryClient.prefetchQuery(progressQueries.summary(db)),
  ])

  if (courseId) {
    await Promise.all([
      queryClient.prefetchQuery(rulesQueries.course(courseId, db)),
      queryClient.prefetchQuery(rulesQueries.items(courseId, db)),
    ])
  }
}

export default function Page(): ReactNode {
  return (
    <PrefetchBoundary prefetch={prefetch}>
      <Suspense fallback={<Loading />}>
        <Pedido />
      </Suspense>
    </PrefetchBoundary>
  )
}

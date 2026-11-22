import type { Metadata } from 'next'
import { Suspense } from 'react'
import type { ReactNode } from 'react'

import { PrefetchBoundary, prefetchCourseId } from '@/app/_prefetch/prefetch-boundary'
import type { PrefetchContext } from '@/app/_prefetch/prefetch-boundary'
import { Registrar } from '@/features/registrar/Registrar'
import { Loading } from '@/features/registrar/Registrar/Loading'
import { activitiesQueries } from '@/services/activities'
import { progressQueries } from '@/services/progress'
import { rulesQueries } from '@/services/rules'

export const metadata: Metadata = { title: 'Registrar atividade' }

async function prefetch(context: PrefetchContext): Promise<void> {
  const { db, queryClient } = context
  // Atividades e progresso não dependem do perfil. Os itens de regra dependem do curso.
  const [courseId] = await Promise.all([
    prefetchCourseId(context),
    queryClient.prefetchQuery(activitiesQueries.list(db)),
    queryClient.prefetchQuery(progressQueries.summary(db)),
  ])

  if (courseId) await queryClient.prefetchQuery(rulesQueries.items(courseId, db))
}

export default function Page(): ReactNode {
  return (
    <PrefetchBoundary prefetch={prefetch}>
      <Suspense fallback={<Loading />}>
        <Registrar />
      </Suspense>
    </PrefetchBoundary>
  )
}

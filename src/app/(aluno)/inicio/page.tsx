import type { Metadata } from 'next'
import { Suspense } from 'react'
import type { ReactNode } from 'react'

import { PrefetchBoundary, prefetchCourseId } from '@/app/_prefetch/prefetch-boundary'
import type { PrefetchContext } from '@/app/_prefetch/prefetch-boundary'
import { Inicio } from '@/features/inicio/Inicio'
import { Loading } from '@/features/inicio/Inicio/Loading'
import { progressQueries } from '@/services/progress'
import { rulesQueries } from '@/services/rules'

export const metadata: Metadata = { title: 'Início' }

async function prefetch(context: PrefetchContext): Promise<void> {
  const { db, queryClient } = context
  // O progresso não depende do perfil, então sai junto. As regras dependem do curso do perfil.
  const [courseId] = await Promise.all([
    prefetchCourseId(context),
    queryClient.prefetchQuery(progressQueries.summary(db)),
  ])

  if (courseId) await queryClient.prefetchQuery(rulesQueries.items(courseId, db))
}

export default function Page(): ReactNode {
  return (
    <PrefetchBoundary prefetch={prefetch}>
      <Suspense fallback={<Loading />}>
        <Inicio />
      </Suspense>
    </PrefetchBoundary>
  )
}

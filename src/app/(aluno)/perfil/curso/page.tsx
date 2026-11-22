import type { Metadata } from 'next'
import { Suspense } from 'react'
import type { ReactNode } from 'react'

import { PrefetchBoundary, prefetchCourseId } from '@/app/_prefetch/prefetch-boundary'
import type { PrefetchContext } from '@/app/_prefetch/prefetch-boundary'
import { TrocarCurso } from '@/features/perfil/TrocarCurso'
import { Loading } from '@/features/perfil/TrocarCurso/Loading'
import { activitiesQueries } from '@/services/activities'
import { rulesQueries } from '@/services/rules'

export const metadata: Metadata = { title: 'Trocar curso' }

async function prefetch(context: PrefetchContext): Promise<void> {
  const { db, queryClient } = context
  // As atividades não dependem do perfil. O curso depende. A lista de cursos só é lida quando a
  // troca está liberada, então fica para o navegador.
  const [courseId] = await Promise.all([
    prefetchCourseId(context),
    queryClient.prefetchQuery(activitiesQueries.list(db)),
  ])

  if (courseId) await queryClient.prefetchQuery(rulesQueries.course(courseId, db))
}

export default function Page(): ReactNode {
  return (
    <PrefetchBoundary prefetch={prefetch}>
      <Suspense fallback={<Loading />}>
        <TrocarCurso />
      </Suspense>
    </PrefetchBoundary>
  )
}

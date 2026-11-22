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
  searchParams: Promise<{ item?: string | string[]; removida?: string | string[] }>
}

async function prefetch(context: PrefetchContext): Promise<void> {
  const { db, queryClient } = context
  // Atividades e progresso não dependem do perfil, então saem junto. As regras dependem do curso.
  const [courseId] = await Promise.all([
    prefetchCourseId(context),
    queryClient.prefetchQuery(activitiesQueries.list(db)),
    queryClient.prefetchQuery(progressQueries.summary(db)),
  ])

  if (courseId) await queryClient.prefetchQuery(rulesQueries.items(courseId, db))
}

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

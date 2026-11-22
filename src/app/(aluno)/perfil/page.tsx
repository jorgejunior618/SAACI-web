import type { Metadata } from 'next'
import { Suspense } from 'react'
import type { ReactNode } from 'react'

import { PrefetchBoundary, prefetchCourseId } from '@/app/_prefetch/prefetch-boundary'
import type { PrefetchContext } from '@/app/_prefetch/prefetch-boundary'
import { Perfil } from '@/features/perfil/Perfil'
import { Loading } from '@/features/perfil/Perfil/Loading'
import { rulesQueries } from '@/services/rules'

export const metadata: Metadata = { title: 'Perfil' }

// A sessão já vem do layout do grupo. Falta o curso, que depende do perfil.
async function prefetch(context: PrefetchContext): Promise<void> {
  const { db, queryClient } = context
  const courseId = await prefetchCourseId(context)

  if (courseId) await queryClient.prefetchQuery(rulesQueries.course(courseId, db))
}

export default function Page(): ReactNode {
  return (
    <PrefetchBoundary prefetch={prefetch}>
      <Suspense fallback={<Loading />}>
        <Perfil />
      </Suspense>
    </PrefetchBoundary>
  )
}

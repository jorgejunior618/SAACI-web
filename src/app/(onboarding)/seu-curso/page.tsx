import type { Metadata } from 'next'
import { Suspense } from 'react'
import type { ReactNode } from 'react'

import { PrefetchBoundary } from '@/app/_prefetch/prefetch-boundary'
import type { PrefetchContext } from '@/app/_prefetch/prefetch-boundary'
import { SeuCurso } from '@/features/curso/SeuCurso'
import { Loading } from '@/features/curso/SeuCurso/Loading'
import { rulesQueries } from '@/services/rules'

export const metadata: Metadata = { title: 'Seu curso' }

async function prefetch({ db, queryClient }: PrefetchContext): Promise<void> {
  await queryClient.prefetchQuery(rulesQueries.courses('', db))
}

export default function Page(): ReactNode {
  return (
    <PrefetchBoundary prefetch={prefetch}>
      <Suspense fallback={<Loading />}>
        <SeuCurso />
      </Suspense>
    </PrefetchBoundary>
  )
}

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
  const { db, prefetchQuery } = context
  // Atividades e progresso não dependem do perfil. Os itens de regra dependem do curso.
  const [courseId] = await Promise.all([
    prefetchCourseId(context),
    prefetchQuery(activitiesQueries.list(db)),
    prefetchQuery(progressQueries.summary(db)),
  ])

  if (courseId) await prefetchQuery(rulesQueries.items(courseId, db))
}

/**
 * Rota `/registrar`: o registro de uma atividade, com a leitura do comprovante.
 *
 * @remarks
 * Busca no servidor o perfil, as atividades, o progresso e os itens de regra do curso, e hidrata o
 * cache para a tela abrir já com o dado.
 *
 * @returns A tela dentro do `PrefetchBoundary`.
 */
export default function Page(): ReactNode {
  return (
    <PrefetchBoundary prefetch={prefetch}>
      <Suspense fallback={<Loading />}>
        <Registrar />
      </Suspense>
    </PrefetchBoundary>
  )
}

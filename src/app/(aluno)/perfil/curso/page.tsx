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
  const { db, prefetchQuery } = context
  // As atividades não dependem do perfil. O curso depende. A lista de cursos só é lida quando a
  // troca está liberada, então fica para o navegador.
  const [courseId] = await Promise.all([
    prefetchCourseId(context),
    prefetchQuery(activitiesQueries.list(db)),
  ])

  if (courseId) await prefetchQuery(rulesQueries.course(courseId, db))
}

/**
 * Rota `/perfil/curso`: a troca de curso, liberada só enquanto o aluno não tem atividades.
 *
 * @remarks
 * Busca no servidor o perfil, as atividades e o curso atual. A lista de cursos fica para o
 * navegador, porque só é lida quando a troca está liberada.
 *
 * @returns A tela dentro do `PrefetchBoundary`.
 */
export default function Page(): ReactNode {
  return (
    <PrefetchBoundary prefetch={prefetch}>
      <Suspense fallback={<Loading />}>
        <TrocarCurso />
      </Suspense>
    </PrefetchBoundary>
  )
}

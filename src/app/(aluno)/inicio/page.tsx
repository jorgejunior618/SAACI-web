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
  const { db, prefetchQuery } = context
  // O progresso não depende do perfil, então sai junto. As regras dependem do curso do perfil.
  const [courseId] = await Promise.all([
    prefetchCourseId(context),
    prefetchQuery(progressQueries.summary(db)),
  ])

  if (courseId) await prefetchQuery(rulesQueries.items(courseId, db))
}

/**
 * Rota `/inicio`: o painel de horas do aluno.
 *
 * @remarks
 * Busca no servidor o perfil, o progresso e os itens de regra do curso, e hidrata o cache para a
 * tela abrir já com o dado.
 *
 * @returns A tela dentro do `PrefetchBoundary`.
 */
export default function Page(): ReactNode {
  return (
    <PrefetchBoundary prefetch={prefetch}>
      <Suspense fallback={<Loading />}>
        <Inicio />
      </Suspense>
    </PrefetchBoundary>
  )
}

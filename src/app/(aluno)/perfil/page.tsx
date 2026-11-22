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
  const { db, prefetchQuery } = context
  const courseId = await prefetchCourseId(context)

  if (courseId) await prefetchQuery(rulesQueries.course(courseId, db))
}

/**
 * Rota `/perfil`: os dados do aluno, o curso e as ações da conta.
 *
 * @remarks
 * A sessão e o perfil vêm do layout. A página busca no servidor o curso do aluno e hidrata o cache.
 *
 * @returns A tela dentro do `PrefetchBoundary`.
 */
export default function Page(): ReactNode {
  return (
    <PrefetchBoundary prefetch={prefetch}>
      <Suspense fallback={<Loading />}>
        <Perfil />
      </Suspense>
    </PrefetchBoundary>
  )
}

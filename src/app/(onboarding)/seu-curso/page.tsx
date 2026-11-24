// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import type { Metadata } from 'next'
import { Suspense } from 'react'
import type { ReactNode } from 'react'

import { PrefetchBoundary } from '@/app/_prefetch/prefetch-boundary'
import type { PrefetchContext } from '@/app/_prefetch/prefetch-boundary'
import { SeuCurso } from '@/features/curso/SeuCurso'
import { Loading } from '@/features/curso/SeuCurso/Loading'
import { rulesQueries } from '@/services/rules'

export const metadata: Metadata = { title: 'Seu curso' }

async function prefetch({ db, prefetchQuery }: PrefetchContext): Promise<void> {
  await prefetchQuery(rulesQueries.courses('', db))
}

/**
 * Rota `/seu-curso`: a escolha do curso, que o aluno faz antes de ver o painel.
 *
 * @remarks
 * Busca no servidor a lista de cursos e hidrata o cache para a tela abrir já com o dado.
 *
 * @returns A tela dentro do `PrefetchBoundary`.
 */
export default function Page(): ReactNode {
  return (
    <PrefetchBoundary prefetch={prefetch}>
      <Suspense fallback={<Loading />}>
        <SeuCurso />
      </Suspense>
    </PrefetchBoundary>
  )
}

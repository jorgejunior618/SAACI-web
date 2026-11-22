import type { Metadata } from 'next'
import { Suspense } from 'react'
import type { ReactNode } from 'react'

import { PrefetchBoundary, prefetchCourseId } from '@/app/_prefetch/prefetch-boundary'
import { ExcluirConta } from '@/features/acesso/ExcluirConta'
import { Loading } from '@/features/acesso/ExcluirConta/Loading'

export const metadata: Metadata = { title: 'Excluir conta' }

export default function Page(): ReactNode {
  // A tela só lê o perfil, para decidir a volta. O backup dos comprovantes usa `useQuery` e busca
  // no navegador, de propósito.
  return (
    <PrefetchBoundary prefetch={prefetchCourseId}>
      <Suspense fallback={<Loading />}>
        <ExcluirConta />
      </Suspense>
    </PrefetchBoundary>
  )
}

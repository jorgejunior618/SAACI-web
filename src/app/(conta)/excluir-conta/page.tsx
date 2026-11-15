import type { Metadata } from 'next'
import { Suspense } from 'react'
import type { ReactNode } from 'react'

import { ExcluirConta } from '@/features/acesso/ExcluirConta'
import { Loading } from '@/features/acesso/ExcluirConta/Loading'

export const metadata: Metadata = { title: 'Excluir conta' }

export default function Page(): ReactNode {
  return (
    <Suspense fallback={<Loading />}>
      <ExcluirConta />
    </Suspense>
  )
}

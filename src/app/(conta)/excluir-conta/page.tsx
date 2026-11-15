import type { Metadata } from 'next'
import { Suspense } from 'react'
import type { ReactNode } from 'react'

import { LoadingState } from '@design-system'

import { ExcluirConta } from '@/features/acesso/ExcluirConta'

export const metadata: Metadata = { title: 'Excluir conta' }

export default function Page(): ReactNode {
  return (
    <Suspense fallback={<LoadingState label="Buscando seus dados" />}>
      <ExcluirConta />
    </Suspense>
  )
}

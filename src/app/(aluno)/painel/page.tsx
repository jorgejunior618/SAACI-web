import type { Metadata } from 'next'
import { type ReactNode, Suspense } from 'react'

import { Painel } from '@/features/painel/Painel'
import { Loading } from '@/features/painel/Painel/Loading'

export const metadata: Metadata = { title: 'Início' }

export default function Page(): ReactNode {
  return (
    <Suspense fallback={<Loading />}>
      <Painel />
    </Suspense>
  )
}

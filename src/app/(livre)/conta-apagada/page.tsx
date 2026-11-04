import type { Metadata } from 'next'
import { type ReactNode, Suspense } from 'react'

import { ContaApagada } from '@/features/perfil/ContaApagada'
import { Loading } from '@/features/perfil/ContaApagada/Loading'

export const metadata: Metadata = { title: 'Conta apagada' }

export default function Page(): ReactNode {
  return (
    <Suspense fallback={<Loading />}>
      <ContaApagada />
    </Suspense>
  )
}

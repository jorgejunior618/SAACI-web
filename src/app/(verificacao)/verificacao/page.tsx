import type { Metadata } from 'next'
import { type ReactNode, Suspense } from 'react'

import { Verificacao } from '@/features/autenticacao/Verificacao'
import { Loading } from '@/features/autenticacao/Verificacao/Loading'

export const metadata: Metadata = { title: 'Confirme seu e-mail' }

export default function Page(): ReactNode {
  return (
    <Suspense fallback={<Loading />}>
      <Verificacao />
    </Suspense>
  )
}

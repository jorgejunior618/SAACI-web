import type { Metadata } from 'next'
import { type ReactNode, Suspense } from 'react'

import { Cadastro } from '@/features/autenticacao/Cadastro'
import { Loading } from '@/features/autenticacao/Cadastro/Loading'

export const metadata: Metadata = { title: 'Criar conta' }

export default function Page(): ReactNode {
  return (
    <Suspense fallback={<Loading />}>
      <Cadastro />
    </Suspense>
  )
}

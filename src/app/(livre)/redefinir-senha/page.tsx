import type { Metadata } from 'next'
import { type ReactNode, Suspense } from 'react'

import { RedefinirSenha } from '@/features/autenticacao/RedefinirSenha'
import { Loading } from '@/features/autenticacao/RedefinirSenha/Loading'

export const metadata: Metadata = { title: 'Escolha a senha nova' }

export default function Page(): ReactNode {
  return (
    <Suspense fallback={<Loading />}>
      <RedefinirSenha />
    </Suspense>
  )
}

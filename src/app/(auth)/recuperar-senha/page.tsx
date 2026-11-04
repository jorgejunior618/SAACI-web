import type { Metadata } from 'next'
import { type ReactNode, Suspense } from 'react'

import { RecuperarSenha } from '@/features/autenticacao/RecuperarSenha'
import { Loading } from '@/features/autenticacao/RecuperarSenha/Loading'

export const metadata: Metadata = { title: 'Criar uma nova senha' }

export default function Page(): ReactNode {
  return (
    <Suspense fallback={<Loading />}>
      <RecuperarSenha />
    </Suspense>
  )
}

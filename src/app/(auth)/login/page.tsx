import type { Metadata } from 'next'
import { type ReactNode, Suspense } from 'react'

import { Login } from '@/features/autenticacao/Login'
import { Loading } from '@/features/autenticacao/Login/Loading'

export const metadata: Metadata = { title: 'Entrar' }

export default function Page(): ReactNode {
  return (
    <Suspense fallback={<Loading />}>
      <Login />
    </Suspense>
  )
}

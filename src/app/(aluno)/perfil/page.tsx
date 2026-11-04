import type { Metadata } from 'next'
import { type ReactNode, Suspense } from 'react'

import { Perfil } from '@/features/perfil/Perfil'
import { Loading } from '@/features/perfil/Perfil/Loading'

export const metadata: Metadata = { title: 'Perfil' }

export default function Page(): ReactNode {
  return (
    <Suspense fallback={<Loading />}>
      <Perfil />
    </Suspense>
  )
}

import type { Metadata } from 'next'
import { Suspense } from 'react'
import type { ReactNode } from 'react'

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

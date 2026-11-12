import type { Metadata } from 'next'
import { Suspense } from 'react'
import type { ReactNode } from 'react'

import { Inicio } from '@/features/inicio/Inicio'
import { Loading } from '@/features/inicio/Inicio/Loading'

export const metadata: Metadata = { title: 'Início' }

export default function Page(): ReactNode {
  return (
    <Suspense fallback={<Loading />}>
      <Inicio />
    </Suspense>
  )
}

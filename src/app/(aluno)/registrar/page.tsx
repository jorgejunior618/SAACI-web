import type { Metadata } from 'next'
import { Suspense } from 'react'
import type { ReactNode } from 'react'

import { Registrar } from '@/features/registrar/Registrar'
import { Loading } from '@/features/registrar/Registrar/Loading'

export const metadata: Metadata = { title: 'Registrar atividade' }

export default function Page(): ReactNode {
  return (
    <Suspense fallback={<Loading />}>
      <Registrar />
    </Suspense>
  )
}

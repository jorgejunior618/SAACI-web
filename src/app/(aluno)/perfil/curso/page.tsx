import type { Metadata } from 'next'
import { type ReactNode, Suspense } from 'react'

import { TrocarCurso } from '@/features/perfil/TrocarCurso'
import { Loading } from '@/features/perfil/TrocarCurso/Loading'

export const metadata: Metadata = { title: 'Trocar curso' }

export default function Page(): ReactNode {
  return (
    <Suspense fallback={<Loading />}>
      <TrocarCurso />
    </Suspense>
  )
}

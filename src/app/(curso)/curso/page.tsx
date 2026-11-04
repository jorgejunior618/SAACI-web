import type { Metadata } from 'next'
import { type ReactNode, Suspense } from 'react'

import { EscolherCurso } from '@/features/curso/EscolherCurso'
import { Loading } from '@/features/curso/EscolherCurso/Loading'

export const metadata: Metadata = { title: 'Seu curso' }

export default function Page(): ReactNode {
  return (
    <Suspense fallback={<Loading />}>
      <EscolherCurso />
    </Suspense>
  )
}

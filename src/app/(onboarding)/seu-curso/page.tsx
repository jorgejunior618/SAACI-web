import type { Metadata } from 'next'
import { Suspense } from 'react'
import type { ReactNode } from 'react'

import { SeuCurso } from '@/features/curso/SeuCurso'
import { Loading } from '@/features/curso/SeuCurso/Loading'

export const metadata: Metadata = { title: 'Seu curso' }

export default function Page(): ReactNode {
  return (
    <Suspense fallback={<Loading />}>
      <SeuCurso />
    </Suspense>
  )
}

import type { Metadata } from 'next'
import { type ReactNode, Suspense } from 'react'

import { Eventos } from '@/features/eventos/Eventos'
import { Loading } from '@/features/eventos/Eventos/Loading'

export const metadata: Metadata = { title: 'Eventos' }

export default function Page(): ReactNode {
  return (
    <Suspense fallback={<Loading />}>
      <Eventos />
    </Suspense>
  )
}

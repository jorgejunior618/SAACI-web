import type { Metadata } from 'next'
import { Suspense } from 'react'
import type { ReactNode } from 'react'

import { ComoEntregar } from '@/features/pedido/ComoEntregar'
import { Loading } from '@/features/pedido/ComoEntregar/Loading'

export const metadata: Metadata = { title: 'Como entregar' }

export default function Page(): ReactNode {
  return (
    <Suspense fallback={<Loading />}>
      <ComoEntregar />
    </Suspense>
  )
}

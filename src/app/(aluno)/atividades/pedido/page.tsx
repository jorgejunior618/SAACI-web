import type { Metadata } from 'next'
import { Suspense } from 'react'
import type { ReactNode } from 'react'

import { Pedido } from '@/features/pedido/Pedido'
import { Loading } from '@/features/pedido/Pedido/Loading'

export const metadata: Metadata = { title: 'Seu pedido' }

export default function Page(): ReactNode {
  return (
    <Suspense fallback={<Loading />}>
      <Pedido />
    </Suspense>
  )
}

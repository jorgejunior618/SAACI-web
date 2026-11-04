import type { Metadata } from 'next'
import { type ReactNode, Suspense } from 'react'

import { Pedido } from '@/features/formulario/Pedido'
import { Loading } from '@/features/formulario/Pedido/Loading'

export const metadata: Metadata = { title: 'Seu pedido' }

export default function Page(): ReactNode {
  return (
    <Suspense fallback={<Loading />}>
      <Pedido />
    </Suspense>
  )
}

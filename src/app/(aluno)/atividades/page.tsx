import type { Metadata } from 'next'
import { type ReactNode, Suspense } from 'react'

import { ListaAtividades } from '@/features/atividades/ListaAtividades'
import { Loading } from '@/features/atividades/ListaAtividades/Loading'

export const metadata: Metadata = { title: 'Atividades' }

export default function Page(): ReactNode {
  return (
    <Suspense fallback={<Loading />}>
      <ListaAtividades />
    </Suspense>
  )
}

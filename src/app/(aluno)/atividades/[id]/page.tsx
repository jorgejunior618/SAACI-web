import type { Metadata } from 'next'
import { type ReactNode, Suspense } from 'react'

import { DetalheAtividade } from '@/features/atividades/DetalheAtividade'
import { Loading } from '@/features/atividades/DetalheAtividade/Loading'

export const metadata: Metadata = { title: 'Atividade' }

type Props = {
  params: Promise<{ id: string }>
}

export default async function Page({ params }: Props): Promise<ReactNode> {
  const { id } = await params

  return (
    <Suspense fallback={<Loading />}>
      <DetalheAtividade id={id} />
    </Suspense>
  )
}

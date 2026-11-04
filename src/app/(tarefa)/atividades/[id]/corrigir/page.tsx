import type { Metadata } from 'next'
import { type ReactNode, Suspense } from 'react'

import { CorrigirAtividade } from '@/features/atividades/CorrigirAtividade'
import { Loading } from '@/features/atividades/CorrigirAtividade/Loading'

export const metadata: Metadata = { title: 'Corrigir atividade' }

type Props = {
  params: Promise<{ id: string }>
}

export default async function Page({ params }: Props): Promise<ReactNode> {
  const { id } = await params

  return (
    <Suspense fallback={<Loading />}>
      <CorrigirAtividade id={id} />
    </Suspense>
  )
}

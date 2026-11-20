import type { Metadata } from 'next'
import { Suspense } from 'react'
import type { ReactNode } from 'react'

import { Detalhe } from '@/features/atividades/Detalhe'
import { Loading } from '@/features/atividades/Detalhe/Loading'

export const metadata: Metadata = { title: 'Atividade' }

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function Page({ params }: PageProps): Promise<ReactNode> {
  const { id } = await params

  return (
    <Suspense fallback={<Loading />}>
      <Detalhe id={id} />
    </Suspense>
  )
}

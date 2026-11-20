import type { Metadata } from 'next'
import { Suspense } from 'react'
import type { ReactNode } from 'react'

import { Atividades } from '@/features/atividades/Atividades'
import { Loading } from '@/features/atividades/Atividades/Loading'
import { parseItemParam, parseRemovedParam } from '@/features/atividades/Atividades/utils'

export const metadata: Metadata = { title: 'Atividades' }

type PageProps = {
  searchParams: Promise<{ item?: string | string[]; removida?: string | string[] }>
}

export default async function Page({ searchParams }: PageProps): Promise<ReactNode> {
  const { item, removida } = await searchParams

  return (
    <Suspense fallback={<Loading />}>
      <Atividades openItem={parseItemParam(item)} removedName={parseRemovedParam(removida)} />
    </Suspense>
  )
}

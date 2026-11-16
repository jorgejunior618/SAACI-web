import type { Metadata } from 'next'
import { Suspense } from 'react'
import type { ReactNode } from 'react'

import { Atividades } from '@/features/atividades/Atividades'
import { Loading } from '@/features/atividades/Atividades/Loading'
import { parseItemParam } from '@/features/atividades/Atividades/utils'

export const metadata: Metadata = { title: 'Atividades' }

type PageProps = {
  searchParams: Promise<{ item?: string | string[] }>
}

export default async function Page({ searchParams }: PageProps): Promise<ReactNode> {
  const { item } = await searchParams

  return (
    <Suspense fallback={<Loading />}>
      <Atividades openItem={parseItemParam(item)} />
    </Suspense>
  )
}

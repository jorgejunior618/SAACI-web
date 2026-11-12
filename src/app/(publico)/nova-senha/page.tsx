import type { Metadata } from 'next'
import { Suspense } from 'react'
import type { ReactNode } from 'react'

import { NovaSenha } from '@/features/acesso/NovaSenha'
import { Loading } from '@/features/acesso/NovaSenha/Loading'

export const metadata: Metadata = { title: 'Nova senha' }

type Props = {
  searchParams: Promise<{ token?: string }>
}

export default async function Page({ searchParams }: Props): Promise<ReactNode> {
  const { token } = await searchParams

  return (
    <Suspense fallback={<Loading />}>
      <NovaSenha token={token} />
    </Suspense>
  )
}

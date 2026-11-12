import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import { ConfirmeEmail } from '@/features/acesso/ConfirmeEmail'

export const metadata: Metadata = { title: 'Confirme seu e-mail' }

type Props = {
  searchParams: Promise<{ token?: string; email?: string; from?: string }>
}

export default async function Page({ searchParams }: Props): Promise<ReactNode> {
  const { token, email, from } = await searchParams

  return <ConfirmeEmail token={token} email={email} from={from} />
}

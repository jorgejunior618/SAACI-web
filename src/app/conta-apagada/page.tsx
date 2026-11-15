import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import { ContaApagada } from '@/features/acesso/ContaApagada'

export const metadata: Metadata = { title: 'Conta apagada' }

export default function Page(): ReactNode {
  return <ContaApagada />
}

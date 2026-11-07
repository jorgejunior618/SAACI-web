import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import { NovaSenha } from '@/features/acesso/NovaSenha'

export const metadata: Metadata = { title: 'Nova senha' }

export default function Page(): ReactNode {
  return <NovaSenha />
}

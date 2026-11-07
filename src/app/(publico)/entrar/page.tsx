import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import { Entrar } from '@/features/acesso/Entrar'

export const metadata: Metadata = { title: 'Entrar' }

export default function Page(): ReactNode {
  return <Entrar />
}

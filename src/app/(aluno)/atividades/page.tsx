import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import { Atividades } from '@/features/atividades/Atividades'

export const metadata: Metadata = { title: 'Atividades' }

export default function Page(): ReactNode {
  return <Atividades />
}

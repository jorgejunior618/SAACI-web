import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import { Detalhe } from '@/features/atividades/Detalhe'

export const metadata: Metadata = { title: 'Atividade' }

export default function Page(): ReactNode {
  return <Detalhe />
}

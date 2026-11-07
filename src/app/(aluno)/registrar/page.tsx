import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import { Registrar } from '@/features/registrar/Registrar'

export const metadata: Metadata = { title: 'Registrar atividade' }

export default function Page(): ReactNode {
  return <Registrar />
}

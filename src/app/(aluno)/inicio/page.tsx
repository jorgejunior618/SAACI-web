import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import { Inicio } from '@/features/inicio/Inicio'

export const metadata: Metadata = { title: 'Início' }

export default function Page(): ReactNode {
  return <Inicio />
}

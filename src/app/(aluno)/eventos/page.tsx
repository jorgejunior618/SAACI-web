import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import { Eventos } from '@/features/eventos/Eventos'

export const metadata: Metadata = { title: 'Eventos' }

export default function Page(): ReactNode {
  return <Eventos />
}

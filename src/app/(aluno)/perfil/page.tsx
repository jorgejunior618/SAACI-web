import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import { Perfil } from '@/features/perfil/Perfil'

export const metadata: Metadata = { title: 'Perfil' }

export default function Page(): ReactNode {
  return <Perfil />
}

import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import { SeuCurso } from '@/features/curso/SeuCurso'

export const metadata: Metadata = { title: 'Seu curso' }

export default function Page(): ReactNode {
  return <SeuCurso />
}

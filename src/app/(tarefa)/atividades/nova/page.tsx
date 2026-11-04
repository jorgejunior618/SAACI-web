import type { Metadata } from 'next'
import { type ReactNode, Suspense } from 'react'

import { RegistrarAtividade } from '@/features/atividades/RegistrarAtividade'
import { Loading } from '@/features/atividades/RegistrarAtividade/Loading'

export const metadata: Metadata = { title: 'Registrar atividade' }

export default function Page(): ReactNode {
  return (
    <Suspense fallback={<Loading />}>
      <RegistrarAtividade />
    </Suspense>
  )
}

import type { Metadata } from 'next'
import { type ReactNode, Suspense } from 'react'

import { PreviaFormulario } from '@/features/formulario/PreviaFormulario'
import { Loading } from '@/features/formulario/PreviaFormulario/Loading'

export const metadata: Metadata = { title: 'Pré-visualizar' }

export default function Page(): ReactNode {
  return (
    <Suspense fallback={<Loading />}>
      <PreviaFormulario />
    </Suspense>
  )
}

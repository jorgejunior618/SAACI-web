import type { Metadata } from 'next'
import { type ReactNode, Suspense } from 'react'

import { AvisoPrivacidade } from '@/features/perfil/AvisoPrivacidade'
import { Loading } from '@/features/perfil/AvisoPrivacidade/Loading'

export const metadata: Metadata = { title: 'Aviso de privacidade' }

export default function Page(): ReactNode {
  return (
    <Suspense fallback={<Loading />}>
      <AvisoPrivacidade />
    </Suspense>
  )
}

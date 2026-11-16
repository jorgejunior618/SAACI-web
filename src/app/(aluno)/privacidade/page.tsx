import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import { AvisoDePrivacidade } from '@/features/privacidade/AvisoDePrivacidade'

export const metadata: Metadata = { title: 'Aviso de privacidade' }

export default function Page(): ReactNode {
  return <AvisoDePrivacidade />
}

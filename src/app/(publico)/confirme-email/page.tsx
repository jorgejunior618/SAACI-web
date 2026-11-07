import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import { ConfirmeEmail } from '@/features/acesso/ConfirmeEmail'

export const metadata: Metadata = { title: 'Confirme seu e-mail' }

export default function Page(): ReactNode {
  return <ConfirmeEmail />
}

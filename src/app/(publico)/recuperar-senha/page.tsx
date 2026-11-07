import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import { RecuperarSenha } from '@/features/acesso/RecuperarSenha'

export const metadata: Metadata = { title: 'Recuperar senha' }

export default function Page(): ReactNode {
  return <RecuperarSenha />
}

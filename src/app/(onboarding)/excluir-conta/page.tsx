import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import { ExcluirConta } from '@/features/acesso/ExcluirConta'

export const metadata: Metadata = { title: 'Excluir conta' }

// TODO: a rota vive em (onboarding) porque só Seu curso a usa hoje. Quando a tela de Perfil oferecer
// Excluir conta, mover para um grupo que atenda quem já tem curso.
export default function Page(): ReactNode {
  return <ExcluirConta />
}

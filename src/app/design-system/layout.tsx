// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'

import { Galeria } from '@/features/design-system/Galeria'

export const metadata: Metadata = { title: 'Design system' }

type Props = {
  children: ReactNode
}

export default function Layout({ children }: Props): ReactNode {
  // Galeria só de desenvolvimento: em produção toda rota abaixo de /design-system responde 404.
  if (process.env.NODE_ENV === 'production') notFound()

  return <Galeria>{children}</Galeria>
}

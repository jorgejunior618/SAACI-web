// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import type { Metadata, Viewport } from 'next'
import { Geist } from 'next/font/google'
import type { ReactNode } from 'react'

import { QueryProvider } from '@/providers/QueryProvider'

import './globals.css'

// Servida pelo próprio site: o Next baixa a fonte no build, sem chamada ao Google em uso.
const geist = Geist({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-geist',
  display: 'swap',
})

export const metadata: Metadata = {
  title: { default: 'SAACI', template: '%s | SAACI' },
  description: 'Registre seus certificados e veja quantas horas complementares faltam.',
  icons: { icon: '/logo-simbolo.png' },
}

// As cores da barra do navegador repetem `surface.sunken` (claro e escuro): mude juntas.
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f6f2ea' },
    { media: '(prefers-color-scheme: dark)', color: '#14130f' },
  ],
}

type Props = {
  children: ReactNode
}

export default function RootLayout({ children }: Props): ReactNode {
  return (
    <html lang="pt-BR" className={geist.variable}>
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  )
}

import type { Metadata, Viewport } from 'next'
import { Geist } from 'next/font/google'
import type { ReactNode } from 'react'

import { MockPanel } from '@/components/MockPanel'
import { QueryProvider } from '@/providers/QueryProvider'
import { ThemeSync } from '@/providers/ThemeSync'
import { themeInitScript } from '@/providers/theme'

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
    // O script do tema muda data-theme antes da hidratação.
    <html lang="pt-BR" className={geist.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <QueryProvider>
          <ThemeSync />
          {children}
          {process.env.NODE_ENV === 'development' && <MockPanel />}
        </QueryProvider>
      </body>
    </html>
  )
}

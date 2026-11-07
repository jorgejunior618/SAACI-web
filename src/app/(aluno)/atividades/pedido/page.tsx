import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import { Pedido } from '@/features/pedido/Pedido'

export const metadata: Metadata = { title: 'Formulário' }

export default function Page(): ReactNode {
  return <Pedido />
}

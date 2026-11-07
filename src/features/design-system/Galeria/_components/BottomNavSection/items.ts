import { ClipboardList, File, House, Plus } from 'lucide-react'

import type { BottomNavProps } from '@design-system'

/** Os quatro destinos do produto, com endereços de exemplo. */
export const items: BottomNavProps['items'] = [
  { id: 'inicio', label: 'Início', href: '#inicio', icon: House },
  { id: 'registrar', label: 'Registrar', href: '#registrar', icon: Plus },
  { id: 'certificados', label: 'Certificados', href: '#certificados', icon: File },
  { id: 'formulario', label: 'Formulário', href: '#formulario', icon: ClipboardList },
]

/** Os `id` dos destinos, para o controle de item ativo. */
export const itemIds = ['inicio', 'registrar', 'certificados', 'formulario'] as const

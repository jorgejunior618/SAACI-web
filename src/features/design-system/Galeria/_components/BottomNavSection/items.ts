import { CalendarCheck, House, ListChecks, Plus, User } from 'lucide-react'

import type { BottomNavProps } from '@design-system'

/** As quatro abas do produto, com endereços de exemplo. */
export const items: BottomNavProps['items'] = [
  { id: 'inicio', label: 'Início', href: '#inicio', icon: House },
  { id: 'atividades', label: 'Atividades', href: '#atividades', icon: ListChecks },
  { id: 'eventos', label: 'Eventos', href: '#eventos', icon: CalendarCheck },
  { id: 'perfil', label: 'Perfil', href: '#perfil', icon: User },
]

/** A ação central, que abre o fluxo de registro. */
export const action: BottomNavProps['action'] = {
  label: 'Registrar',
  href: '#registrar',
  icon: Plus,
}

/** Os `id` das abas, para o controle de aba ativa. */
export const itemIds = ['inicio', 'atividades', 'eventos', 'perfil'] as const

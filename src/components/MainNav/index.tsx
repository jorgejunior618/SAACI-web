'use client'

import { CalendarCheck, House, ListChecks, Plus, User } from 'lucide-react'
import NextLink from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

import { BottomNav } from '@design-system'
import type { BottomNavProps } from '@design-system'

import { getActiveTab } from './utils'

const ITEMS: BottomNavProps['items'] = [
  { id: 'inicio', label: 'Início', href: '/inicio', icon: House },
  { id: 'atividades', label: 'Atividades', href: '/atividades', icon: ListChecks },
  { id: 'eventos', label: 'Eventos', href: '/eventos', icon: CalendarCheck },
  { id: 'perfil', label: 'Perfil', href: '/perfil', icon: User },
]

const ACTION: BottomNavProps['action'] = { label: 'Registrar', href: '/registrar', icon: Plus }

/**
 * Mostra a barra inferior do app, com a aba da rota atual acesa.
 *
 * @remarks
 * Navega com `next/link`, que busca a rota antes do toque. Passe no `bottomNav` do `AppFrame` das
 * telas de aba, de Detalhe e de Formulário. A tela de Registrar não usa a barra. A aba ativa vem do
 * caminho da URL, então a tela não precisa informar qual é.
 *
 * @example
 * ```tsx
 * <AppFrame topBar={<TopBar variant="root" title="Atividades" />} bottomNav={<MainNav />}>
 *   ...
 * </AppFrame>
 * ```
 */
export function MainNav(): ReactNode {
  const activeId = getActiveTab(usePathname()) ?? ''

  return <BottomNav items={ITEMS} action={ACTION} activeId={activeId} linkAs={NextLink} />
}

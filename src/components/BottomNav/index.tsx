'use client'

import { Calendar, House, ListChecks, type LucideIcon, Plus, User } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

import { ROUTES } from '@/constants/routes'

import * as S from './styles'

type Tab = {
  href: string
  label: string
  icon: LucideIcon
  // Rotas que também acendem a aba.
  matches: readonly string[]
}

const TABS: readonly Tab[] = [
  { href: ROUTES.painel, label: 'Início', icon: House, matches: [ROUTES.painel] },
  {
    href: ROUTES.atividades,
    label: 'Atividades',
    icon: ListChecks,
    matches: [ROUTES.atividades, ROUTES.formulario],
  },
  { href: ROUTES.eventos, label: 'Eventos', icon: Calendar, matches: [ROUTES.eventos] },
  { href: ROUTES.perfil, label: 'Perfil', icon: User, matches: [ROUTES.perfil] },
]

function TabLink({ tab, pathname }: { tab: Tab; pathname: string }): ReactNode {
  const isActive = tab.matches.some((rota) => pathname.startsWith(rota))
  const { icon: TabIcon } = tab

  return (
    <Link href={tab.href} className={S.link} aria-current={isActive ? 'page' : undefined}>
      <TabIcon size={22} strokeWidth={1.5} aria-hidden />
      {tab.label}
    </Link>
  )
}

export function BottomNav(): ReactNode {
  const pathname = usePathname()
  const [inicio, atividades, eventos, perfil] = TABS

  return (
    <S.Nav aria-label="Principal">
      <TabLink tab={inicio} pathname={pathname} />
      <TabLink tab={atividades} pathname={pathname} />
      <Link href={ROUTES.novaAtividade} className={S.link}>
        <S.Fab>
          <Plus size={20} aria-hidden />
        </S.Fab>
        Registrar
      </Link>
      <TabLink tab={eventos} pathname={pathname} />
      <TabLink tab={perfil} pathname={pathname} />
    </S.Nav>
  )
}

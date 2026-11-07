'use client'

import { CalendarCheck } from 'lucide-react'
import type { ReactNode } from 'react'

import { AppFrame, StateScreen, TopBar } from '@design-system'

import { MainNav } from '@/components/MainNav'

/**
 * Mostra a tela provisória deste fluxo. Quem pegar a issue troca o corpo e mantém o nome e o caminho
 * do arquivo, porque a rota já importa daqui.
 */
export function Eventos(): ReactNode {
  return (
    <AppFrame topBar={<TopBar variant="root" title="Eventos" />} bottomNav={<MainNav />}>
      <StateScreen
        variant="empty"
        icon={CalendarCheck}
        eyebrow="Em construção"
        title="Eventos"
        description="Esta tela ainda não foi montada."
      />
    </AppFrame>
  )
}

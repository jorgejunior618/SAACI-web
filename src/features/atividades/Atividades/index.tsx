'use client'

import { ListChecks } from 'lucide-react'
import type { ReactNode } from 'react'

import { AppFrame, StateScreen, TopBar } from '@design-system'

import { MainNav } from '@/components/MainNav'

/**
 * Mostra a tela provisória deste fluxo. Quem pegar a issue troca o corpo e mantém o nome e o caminho
 * do arquivo, porque a rota já importa daqui.
 */
export function Atividades(): ReactNode {
  return (
    <AppFrame topBar={<TopBar variant="root" title="Atividades" />} bottomNav={<MainNav />}>
      <StateScreen
        variant="empty"
        icon={ListChecks}
        eyebrow="Em construção"
        title="Atividades"
        description="Esta tela ainda não foi montada."
      />
    </AppFrame>
  )
}

'use client'

import { House } from 'lucide-react'
import type { ReactNode } from 'react'

import { AppFrame, StateScreen, TopBar } from '@design-system'

import { MainNav } from '@/components/MainNav'

/**
 * Mostra a tela provisória deste fluxo. Quem pegar a issue troca o corpo e mantém o nome e o caminho
 * do arquivo, porque a rota já importa daqui.
 */
export function Inicio(): ReactNode {
  return (
    <AppFrame topBar={<TopBar variant="home" />} bottomNav={<MainNav />}>
      <StateScreen
        variant="empty"
        icon={House}
        eyebrow="Em construção"
        title="Início"
        description="Esta tela ainda não foi montada."
      />
    </AppFrame>
  )
}

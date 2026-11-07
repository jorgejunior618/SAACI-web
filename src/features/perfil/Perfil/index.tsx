'use client'

import { User } from 'lucide-react'
import type { ReactNode } from 'react'

import { AppFrame, StateScreen, TopBar } from '@design-system'

import { MainNav } from '@/components/MainNav'

/**
 * Mostra a tela provisória deste fluxo. Quem pegar a issue troca o corpo e mantém o nome e o caminho
 * do arquivo, porque a rota já importa daqui.
 */
export function Perfil(): ReactNode {
  return (
    <AppFrame topBar={<TopBar variant="root" title="Perfil" />} bottomNav={<MainNav />}>
      <StateScreen
        variant="empty"
        icon={User}
        eyebrow="Em construção"
        title="Perfil"
        description="Esta tela ainda não foi montada."
      />
    </AppFrame>
  )
}

'use client'

import { LogIn } from 'lucide-react'
import type { ReactNode } from 'react'

import { AppFrame, StateScreen } from '@design-system'

/**
 * Mostra a tela provisória deste fluxo. Quem pegar a issue troca o corpo e mantém o nome e o caminho
 * do arquivo, porque a rota já importa daqui.
 */
export function Entrar(): ReactNode {
  return (
    <AppFrame>
      <StateScreen
        variant="empty"
        icon={LogIn}
        eyebrow="Em construção"
        title="Entrar"
        description="Esta tela ainda não foi montada."
      />
    </AppFrame>
  )
}

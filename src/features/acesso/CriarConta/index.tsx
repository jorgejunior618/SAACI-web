'use client'

import { UserPlus } from 'lucide-react'
import type { ReactNode } from 'react'

import { AppFrame, StateScreen } from '@design-system'

/**
 * Mostra a tela provisória deste fluxo. Quem pegar a issue troca o corpo e mantém o nome e o caminho
 * do arquivo, porque a rota já importa daqui.
 */
export function CriarConta(): ReactNode {
  return (
    <AppFrame>
      <StateScreen
        variant="empty"
        icon={UserPlus}
        eyebrow="Em construção"
        title="Criar conta"
        description="Esta tela ainda não foi montada."
      />
    </AppFrame>
  )
}

'use client'

import { KeyRound } from 'lucide-react'
import type { ReactNode } from 'react'

import { AppFrame, StateScreen } from '@design-system'

/**
 * Mostra a tela provisória deste fluxo. Quem pegar a issue troca o corpo e mantém o nome e o caminho
 * do arquivo, porque a rota já importa daqui.
 */
export function NovaSenha(): ReactNode {
  return (
    <AppFrame>
      <StateScreen
        variant="empty"
        icon={KeyRound}
        eyebrow="Em construção"
        title="Nova senha"
        description="Esta tela ainda não foi montada."
      />
    </AppFrame>
  )
}

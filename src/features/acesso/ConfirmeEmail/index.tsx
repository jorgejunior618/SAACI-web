'use client'

import { Mail } from 'lucide-react'
import type { ReactNode } from 'react'

import { AppFrame, StateScreen } from '@design-system'

/**
 * Mostra a tela provisória deste fluxo. Quem pegar a issue troca o corpo e mantém o nome e o caminho
 * do arquivo, porque a rota já importa daqui.
 */
export function ConfirmeEmail(): ReactNode {
  return (
    <AppFrame>
      <StateScreen
        variant="empty"
        icon={Mail}
        eyebrow="Em construção"
        title="Confirme seu e-mail"
        description="Esta tela ainda não foi montada."
      />
    </AppFrame>
  )
}

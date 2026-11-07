'use client'

import { Camera } from 'lucide-react'
import NextLink from 'next/link'
import type { ReactNode } from 'react'

import { AppFrame, StateScreen, TopBar } from '@design-system'

/**
 * Mostra a tela provisória deste fluxo. Quem pegar a issue troca o corpo e mantém o nome e o caminho
 * do arquivo, porque a rota já importa daqui.
 */
export function Registrar(): ReactNode {
  return (
    <AppFrame
      topBar={
        <TopBar variant="inner" title="Registrar atividade" backHref="/inicio" linkAs={NextLink} />
      }
    >
      <StateScreen
        variant="empty"
        icon={Camera}
        eyebrow="Em construção"
        title="Registrar atividade"
        description="Esta tela ainda não foi montada."
      />
    </AppFrame>
  )
}

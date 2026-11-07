'use client'

import { FileText } from 'lucide-react'
import NextLink from 'next/link'
import type { ReactNode } from 'react'

import { AppFrame, StateScreen, TopBar } from '@design-system'

import { MainNav } from '@/components/MainNav'

/**
 * Mostra a tela provisória deste fluxo. Quem pegar a issue troca o corpo e mantém o nome e o caminho
 * do arquivo, porque a rota já importa daqui.
 */
export function Detalhe(): ReactNode {
  return (
    <AppFrame
      topBar={<TopBar variant="inner" title="Atividade" backHref="/atividades" linkAs={NextLink} />}
      bottomNav={<MainNav />}
    >
      <StateScreen
        variant="empty"
        icon={FileText}
        eyebrow="Em construção"
        title="Atividade"
        description="Esta tela ainda não foi montada."
      />
    </AppFrame>
  )
}

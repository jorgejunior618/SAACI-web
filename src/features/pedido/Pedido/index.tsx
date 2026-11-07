'use client'

import { ClipboardList } from 'lucide-react'
import NextLink from 'next/link'
import type { ReactNode } from 'react'

import { AppFrame, StateScreen, TopBar } from '@design-system'

import { MainNav } from '@/components/MainNav'

/**
 * Mostra a tela provisória deste fluxo. Quem pegar a issue troca o corpo e mantém o nome e o caminho
 * do arquivo, porque a rota já importa daqui.
 */
export function Pedido(): ReactNode {
  return (
    <AppFrame
      topBar={
        <TopBar variant="inner" title="Formulário" backHref="/atividades" linkAs={NextLink} />
      }
      bottomNav={<MainNav />}
    >
      <StateScreen
        variant="empty"
        icon={ClipboardList}
        eyebrow="Em construção"
        title="Formulário"
        description="Esta tela ainda não foi montada."
      />
    </AppFrame>
  )
}

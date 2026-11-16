'use client'

import { ListChecks } from 'lucide-react'
import NextLink from 'next/link'
import type { ReactNode } from 'react'

import { AppFrame, Button, StateScreen, TopBar } from '@design-system'

/**
 * Registrar de um curso sem itens cadastrados: sem os itens do formulário não há onde a atividade
 * entrar.
 *
 * @remarks
 * Quem decide entrar neste estado é o `Registrar`, quando `rulesQueries.items` vem vazio.
 */
export function Empty(): ReactNode {
  return (
    <AppFrame
      topBar={
        <TopBar variant="inner" title="Registrar atividade" backHref="/inicio" linkAs={NextLink} />
      }
    >
      <StateScreen
        variant="empty"
        icon={ListChecks}
        title="Seu curso ainda não tem os itens do formulário"
        description="Sem eles não dá para saber onde a atividade entra. Avise a coordenação do curso e tente de novo depois."
        actions={
          <Button as={NextLink} href="/inicio" block>
            Voltar ao início
          </Button>
        }
      />
    </AppFrame>
  )
}

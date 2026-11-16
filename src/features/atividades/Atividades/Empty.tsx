'use client'

import { Folder } from 'lucide-react'
import NextLink from 'next/link'
import type { ReactNode } from 'react'

import { AppFrame, Button, Link, StateScreen, TopBar } from '@design-system'

import { MainNav } from '@/components/MainNav'

/**
 * Atividades de quem ainda não registrou nenhuma: diz o que vai aparecer aqui e leva ao registro.
 *
 * @remarks
 * Quem decide entrar neste estado é o `Atividades`, quando a lista vem vazia. "Ver meu pedido" fica
 * mesmo sem atividade, porque o passo a passo do pedido já serve antes do primeiro registro.
 */
export function Empty(): ReactNode {
  return (
    <AppFrame topBar={<TopBar variant="root" title="Atividades" />} bottomNav={<MainNav />}>
      <StateScreen
        variant="empty"
        icon={Folder}
        title="Suas atividades vão aparecer aqui"
        description="Organizadas por item, cada uma com o comprovante pronto para baixar e entregar na coordenação."
        actions={
          <>
            <Button as={NextLink} href="/registrar" block>
              Registrar a primeira atividade
            </Button>
            <Link as={NextLink} href="/atividades/pedido" isStandalone>
              Ver meu pedido
            </Link>
          </>
        }
      />
    </AppFrame>
  )
}

// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

'use client'

import { ClipboardList } from 'lucide-react'
import NextLink from 'next/link'
import type { ReactNode } from 'react'

import { AppFrame, Button, StateScreen, TopBar } from '@design-system'

import { MainNav } from '@/components/MainNav'

/**
 * Seu pedido de quem ainda não registrou atividade: diz como o formulário nasce e leva ao registro.
 *
 * @remarks
 * Quem decide entrar neste estado é o `Pedido`, quando a lista de atividades vem vazia. Sem
 * atividade não há horas nem comprovante, então a lista do que falta não ajudaria.
 */
export function Empty(): ReactNode {
  return (
    <AppFrame
      topBar={
        <TopBar variant="inner" title="Seu pedido" backHref="/atividades" linkAs={NextLink} />
      }
      bottomNav={<MainNav />}
    >
      <StateScreen
        variant="empty"
        icon={ClipboardList}
        title="Seu formulário começa na primeira atividade"
        description="Registre uma atividade com o comprovante. O SAACI preenche o formulário da coordenação com as suas horas."
        actions={
          <Button as={NextLink} href="/registrar" block>
            Registrar a primeira atividade
          </Button>
        }
      />
    </AppFrame>
  )
}

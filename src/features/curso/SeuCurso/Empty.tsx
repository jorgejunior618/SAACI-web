// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

'use client'

import { GraduationCap } from 'lucide-react'
import type { ReactNode } from 'react'

import { AppFrame, StateScreen, TopBar } from '@design-system'

import { AccountLinks } from './_components/AccountLinks'

/**
 * Seu curso quando nenhum curso tem regras cadastradas ainda.
 *
 * @remarks
 * Sem curso não dá para seguir, então a tela só diz isso e deixa Sair e Excluir conta à mão.
 */
export function Empty(): ReactNode {
  return (
    <AppFrame topBar={<TopBar variant="home" />}>
      <StateScreen
        variant="empty"
        icon={GraduationCap}
        title="Ainda não temos cursos"
        description="O SAACI está incluindo os cursos aos poucos. Volte em alguns dias. Os dados da sua conta ficam guardados."
        actions={<AccountLinks />}
      />
    </AppFrame>
  )
}

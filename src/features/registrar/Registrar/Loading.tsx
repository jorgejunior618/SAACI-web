// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import NextLink from 'next/link'
import type { ReactNode } from 'react'

import { AppFrame, LoadingState, TopBar } from '@design-system'

/** Carregamento da tela Registrar atividade, com o Voltar já no lugar e sem a barra inferior. */
export function Loading(): ReactNode {
  return (
    <AppFrame
      topBar={
        <TopBar variant="inner" title="Registrar atividade" backHref="/inicio" linkAs={NextLink} />
      }
    >
      <LoadingState label="Buscando os itens do seu curso" />
    </AppFrame>
  )
}

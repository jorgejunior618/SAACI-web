// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import type { ReactNode } from 'react'

import { AppFrame, LoadingState, TopBar } from '@design-system'

/**
 * Carregamento da tela Excluir conta, com a barra de topo já no lugar.
 *
 * @remarks
 * O Voltar fica de fora enquanto o perfil não chegou, porque o destino dele (Perfil ou Seu curso)
 * depende de o aluno já ter escolhido o curso.
 */
export function Loading(): ReactNode {
  return (
    <AppFrame topBar={<TopBar variant="inner" title="Excluir conta" />}>
      <LoadingState label="Buscando seus dados" />
    </AppFrame>
  )
}

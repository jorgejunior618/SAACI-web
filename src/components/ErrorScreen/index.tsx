// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

'use client'

import type { ReactNode } from 'react'

import { AppFrame, Button, StateScreen } from '@design-system'

export type ErrorScreenProps = {
  /** Valor lançado pela tela. O Next entrega, mas a mensagem não é exibida ao aluno. */
  error: unknown
  /** Renderiza a tela de novo. O Next entrega no `error.tsx` do grupo. */
  retry: () => void
}

/**
 * Mostra a tela de falha de um grupo de rota, com o botão que tenta de novo.
 *
 * @remarks
 * Cada `error.tsx` de grupo só reexporta este componente. A mensagem do erro não aparece: ela pode
 * trazer detalhe técnico, e a tela diz ao aluno apenas o que fazer a seguir.
 *
 * @example
 * ```tsx
 * 'use client'
 *
 * export { ErrorScreen as default } from '@/components/ErrorScreen'
 * ```
 */
export function ErrorScreen({ retry }: ErrorScreenProps): ReactNode {
  return (
    <AppFrame>
      <StateScreen
        variant="connectionError"
        title="Não conseguimos carregar esta tela"
        description="Confira sua internet e tente de novo. Se continuar, volte daqui a pouco."
        actions={
          <Button variant="secondary" block onClick={retry}>
            Tentar de novo
          </Button>
        }
      />
    </AppFrame>
  )
}

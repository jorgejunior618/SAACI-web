// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import type { ReactNode } from 'react'

import { NotFoundScreen } from '@/components/NotFoundScreen'

export default function NotFound(): ReactNode {
  return (
    <NotFoundScreen
      title="Não encontramos esta atividade"
      description="Ela pode ter sido removida. Volte para a lista e escolha outra."
      backHref="/atividades"
      backLabel="Voltar para Atividades"
    />
  )
}

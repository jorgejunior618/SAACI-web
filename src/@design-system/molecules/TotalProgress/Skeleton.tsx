// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import type { ReactNode } from 'react'

import { Card } from '../../atoms/Card'
import * as S from './skeleton.styles'

/**
 * Esqueleto do `TotalProgress` enquanto as horas carregam, com a mesma altura do cartão real.
 *
 * @remarks
 * Escondido de leitor de tela: o aviso de carregamento é da tela. Com `prefers-reduced-motion` o
 * pulso roda uma vez só.
 */
export function TotalProgressSkeleton(): ReactNode {
  return (
    <Card as="section" aria-hidden="true">
      <S.Total />
      <S.Label />
      <S.Bar />
      <S.Meta />
    </Card>
  )
}

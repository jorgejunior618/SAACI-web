// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import type { ReactNode } from 'react'

import { Card } from '../../atoms/Card'
import * as S from './skeleton.styles'

/**
 * Esqueleto do `CategoryCard` enquanto as horas carregam, com o mesmo ritmo do cartão real.
 *
 * @remarks
 * Escondido de leitor de tela: o aviso de carregamento é da tela. Com `prefers-reduced-motion` o
 * pulso roda uma vez só.
 */
export function CategoryCardSkeleton(): ReactNode {
  return (
    <Card aria-hidden="true">
      <S.ItemNumber />
      <S.Name />
      <S.Hours />
      <S.Bar />
      <S.Foot />
    </Card>
  )
}

// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import type { ReactNode } from 'react'

import * as S from './styles'

type Props = {
  /** Nome da variante ou do estado mostrado, escrito como no código (`size="sm"`, `busy`). */
  label: string
  /** Tira a moldura do quadro. Use quando o componente já tem borda própria, como o `Card`. */
  isPlain?: boolean
  /** O componente naquela variante ou estado. */
  children: ReactNode
}

/** Quadro de uma variante ou estado, com o componente em cima e o nome embaixo. */
export function Specimen({ label, isPlain = false, children }: Props): ReactNode {
  return (
    <S.Root>
      <S.Stage plain={isPlain}>{children}</S.Stage>
      <S.Caption>{label}</S.Caption>
    </S.Root>
  )
}

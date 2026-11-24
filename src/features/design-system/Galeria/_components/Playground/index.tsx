// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import type { ReactNode } from 'react'

import * as S from './styles'

type Props = {
  /** O componente com as props vindas do estado do painel. */
  children: ReactNode
  /** Os controles (`SelectControl`, `SwitchControl`, `RangeControl`), um por prop. */
  controls: ReactNode
}

/**
 * Área de teste de um componente: o palco à esquerda e o painel de controles à direita.
 *
 * @remarks
 * Não guarda estado. Quem usa fica num componente client, mantém o valor de cada prop e o passa ao
 * componente e aos controles.
 */
export function Playground({ children, controls }: Props): ReactNode {
  return (
    <S.Root aria-label="Teste das props">
      <S.Stage>{children}</S.Stage>
      <S.Panel>
        <S.PanelTitle>Props</S.PanelTitle>
        {controls}
      </S.Panel>
    </S.Root>
  )
}

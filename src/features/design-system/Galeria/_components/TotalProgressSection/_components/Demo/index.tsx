// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'

import { TotalProgress } from '@design-system'

import { RangeControl } from '../../../Controls'
import { Playground } from '../../../Playground'
import * as S from './styles'

/**
 * Área de teste do `TotalProgress`. Faz aqui o que o cálculo único faz para a tela: `doneHours` é a
 * soma arredondada para baixo e limitada à meta, `missingHours` é a meta menos ele, e a soma inteira
 * vai em `itemsSum`.
 */
export function Demo(): ReactNode {
  const [itemsSum, setItemsSum] = useState(73.5)
  const [goalHours, setGoalHours] = useState(120)
  const doneHours = Math.min(Math.floor(itemsSum), goalHours)

  return (
    <Playground
      controls={
        <>
          <RangeControl
            label="itemsSum"
            value={itemsSum}
            min={0}
            max={160}
            onChange={setItemsSum}
          />
          <RangeControl
            label="goalHours"
            value={goalHours}
            min={1}
            max={160}
            onChange={setGoalHours}
          />
        </>
      }
    >
      <S.Wrap>
        <TotalProgress
          doneHours={doneHours}
          missingHours={goalHours - doneHours}
          goalHours={goalHours}
          itemsSum={itemsSum}
          guideHref="#"
        />
      </S.Wrap>
    </Playground>
  )
}

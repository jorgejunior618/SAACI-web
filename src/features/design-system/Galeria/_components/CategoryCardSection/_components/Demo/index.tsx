// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'

import { CategoryCard } from '@design-system'

import { RangeControl } from '../../../Controls'
import { Playground } from '../../../Playground'
import * as S from './styles'

/** Área de teste do `CategoryCard`: `countedHours` no máximo liga o estado completo. */
export function Demo(): ReactNode {
  const [countedHours, setCountedHours] = useState(18)
  const [maxHours, setMaxHours] = useState(60)
  const [overflowHours, setOverflowHours] = useState(4)

  return (
    <Playground
      controls={
        <>
          <RangeControl
            label="countedHours"
            value={countedHours}
            min={0}
            max={80}
            onChange={setCountedHours}
          />
          <RangeControl label="maxHours" value={maxHours} min={1} max={80} onChange={setMaxHours} />
          <RangeControl
            label="overflowHours"
            value={overflowHours}
            min={0}
            max={20}
            onChange={setOverflowHours}
          />
        </>
      }
    >
      <S.Wrap>
        <CategoryCard
          itemNumber={7}
          name="Curso na área de engenharia de computação"
          countedHours={countedHours}
          maxHours={maxHours}
          overflowHours={overflowHours}
          href="#"
        />
      </S.Wrap>
    </Playground>
  )
}

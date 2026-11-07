'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'

import { TotalProgress } from '@design-system'

import { RangeControl } from '../../../Controls'
import { Playground } from '../../../Playground'
import * as S from './styles'

/** Área de teste do `TotalProgress`: `doneHours` acima da meta mostra o estado completo. */
export function Demo(): ReactNode {
  const [doneHours, setDoneHours] = useState(73.5)
  const [goalHours, setGoalHours] = useState(120)

  return (
    <Playground
      controls={
        <>
          <RangeControl
            label="doneHours"
            value={doneHours}
            min={0}
            max={160}
            onChange={setDoneHours}
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
        <TotalProgress doneHours={doneHours} goalHours={goalHours} guideHref="#" />
      </S.Wrap>
    </Playground>
  )
}

'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'

import { ProgressBar } from '@design-system'

import { RangeControl } from '../../../Controls'
import { Playground } from '../../../Playground'
import * as S from './styles'

/** Área de teste do `ProgressBar`: `value` pode passar de `max` para ver o corte. */
export function Demo(): ReactNode {
  const [value, setValue] = useState(12)
  const [max, setMax] = useState(20)

  return (
    <Playground
      controls={
        <>
          <RangeControl label="value" value={value} min={-5} max={40} onChange={setValue} />
          <RangeControl label="max" value={max} min={0} max={40} onChange={setMax} />
        </>
      }
    >
      <S.Wrap>
        <ProgressBar value={value} max={max} label="Horas de Extensão" />
        <S.Caption>
          {value} de {max}
        </S.Caption>
      </S.Wrap>
    </Playground>
  )
}

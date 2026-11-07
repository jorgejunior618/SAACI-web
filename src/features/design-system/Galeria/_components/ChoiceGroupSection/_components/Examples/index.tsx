'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'

import { ChoiceGroup } from '@design-system'

import { Specimen } from '../../../Specimen'
import { AUTHOR_OPTIONS } from '../../options'
import * as S from './styles'

/** Exemplos do `ChoiceGroup`. Ficam num componente de cliente porque o grupo é controlado. */
export function Examples(): ReactNode {
  const [empty, setEmpty] = useState<string | null>(null)
  const [chosen, setChosen] = useState<string | null>('segundo')
  const [withError, setWithError] = useState<string | null>(null)
  const [isChecked, setIsChecked] = useState(true)

  return (
    <>
      <Specimen label="radio · nada marcado de início">
        <S.Wide>
          <ChoiceGroup
            legend="Você é qual autor do artigo?"
            name="exemplo-vazio"
            options={AUTHOR_OPTIONS}
            value={empty}
            onChange={setEmpty}
          />
        </S.Wide>
      </Specimen>
      <Specimen label="radio · marcada em brand.soft">
        <S.Wide>
          <ChoiceGroup
            legend="Você é qual autor do artigo?"
            name="exemplo-marcado"
            options={AUTHOR_OPTIONS}
            value={chosen}
            onChange={setChosen}
          />
        </S.Wide>
      </Specimen>
      <Specimen label="radio · error">
        <S.Wide>
          <ChoiceGroup
            legend="Você é qual autor do artigo?"
            name="exemplo-erro"
            options={AUTHOR_OPTIONS}
            value={withError}
            onChange={setWithError}
            error="Escolha uma opção para ver quanto a atividade conta."
          />
        </S.Wide>
      </Specimen>
      <Specimen label='variant="single" · checkbox isolado'>
        <S.Wide>
          <ChoiceGroup
            variant="single"
            label="Baixar também os certificados que não contam"
            checked={isChecked}
            onChange={setIsChecked}
          />
        </S.Wide>
      </Specimen>
    </>
  )
}

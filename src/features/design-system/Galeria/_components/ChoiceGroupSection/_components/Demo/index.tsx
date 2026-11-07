'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'

import { ChoiceGroup } from '@design-system'

import { SelectControl, SwitchControl } from '../../../Controls'
import { Playground } from '../../../Playground'
import { AUTHOR_OPTIONS } from '../../options'
import * as S from './styles'

const VARIANTS = ['radio', 'single'] as const

/** Área de teste do `ChoiceGroup`: variante, erro e linha de efeito. */
export function Demo(): ReactNode {
  const [variant, setVariant] = useState<(typeof VARIANTS)[number]>('radio')
  const [hasError, setHasError] = useState(false)
  const [hasEffect, setHasEffect] = useState(true)
  const [value, setValue] = useState<string | null>(null)
  const [checked, setChecked] = useState(false)

  const options = hasEffect
    ? AUTHOR_OPTIONS
    : AUTHOR_OPTIONS.map(({ value: optionValue, label }) => ({ value: optionValue, label }))

  return (
    <Playground
      controls={
        <>
          <SelectControl label="variant" value={variant} options={VARIANTS} onChange={setVariant} />
          <SwitchControl label="error" checked={hasError} onChange={setHasError} />
          <SwitchControl label="effect" checked={hasEffect} onChange={setHasEffect} />
        </>
      }
    >
      <S.Wrap>
        {variant === 'radio' ? (
          <ChoiceGroup
            legend="Você é qual autor do artigo?"
            name="demo"
            options={options}
            value={value}
            onChange={setValue}
            error={hasError ? 'Escolha uma opção para ver quanto a atividade conta.' : undefined}
          />
        ) : (
          <ChoiceGroup
            variant="single"
            label="Baixar também os certificados que não contam"
            checked={checked}
            onChange={setChecked}
          />
        )}
      </S.Wrap>
    </Playground>
  )
}

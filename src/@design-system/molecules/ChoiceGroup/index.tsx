import type { ReactNode } from 'react'

import * as S from './styles'

type Option = {
  value: string
  label: string
  // A consequência da escolha: "Conta neste item, 2h por palestra".
  description?: string
}

type Props = {
  legend: string
  name: string
  options: readonly Option[]
  value: string | null
  onChange: (value: string) => void
}

export function ChoiceGroup({ legend, name, options, value, onChange }: Props): ReactNode {
  return (
    <S.Fieldset>
      <S.Legend>{legend}</S.Legend>
      <S.List>
        {options.map((option) => (
          <label key={option.value} className={S.option}>
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className={S.radio}
            />
            <S.Text>
              {option.label}
              {option.description && <S.Description>{option.description}</S.Description>}
            </S.Text>
          </label>
        ))}
      </S.List>
    </S.Fieldset>
  )
}

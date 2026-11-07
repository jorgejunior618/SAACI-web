import type { ReactNode } from 'react'

import * as S from './styles'

type SelectControlProps<T extends string> = {
  /** Nome da prop, como no código (`variant`). */
  label: string
  value: T
  /** Valores aceitos pela prop. */
  options: readonly T[]
  onChange: (value: T) => void
}

/** Lista de escolha para uma prop de valores fixos (`variant`, `size`, `tone`). */
export function SelectControl<T extends string>({
  label,
  value,
  options,
  onChange,
}: SelectControlProps<T>): ReactNode {
  return (
    <S.Field>
      {label}
      <S.Select
        value={value}
        onChange={(event) => {
          // Devolve o próprio item da lista, então o tipo T se mantém sem cast.
          const next = options.find((option) => option === event.target.value)

          if (next !== undefined) onChange(next)
        }}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </S.Select>
    </S.Field>
  )
}

type SwitchControlProps = {
  /** Nome da prop, como no código (`busy`, `disabled`). */
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}

/** Liga ou desliga uma prop booleana. */
export function SwitchControl({ label, checked, onChange }: SwitchControlProps): ReactNode {
  return (
    <S.Inline>
      {label}
      <S.Checkbox
        type="checkbox"
        role="switch"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
    </S.Inline>
  )
}

type RangeControlProps = {
  /** Nome da prop, como no código (`value`, `max`). */
  label: string
  value: number
  min: number
  max: number
  onChange: (value: number) => void
}

/** Deslizador para uma prop numérica, com o valor atual ao lado do nome. */
export function RangeControl({ label, value, min, max, onChange }: RangeControlProps): ReactNode {
  return (
    <S.Field>
      <span>
        {label} <S.Value>{value}</S.Value>
      </span>
      <S.Range
        type="range"
        value={value}
        min={min}
        max={max}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </S.Field>
  )
}

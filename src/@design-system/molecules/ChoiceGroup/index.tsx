import { useId } from 'react'
import type { ReactNode } from 'react'

import * as S from './styles'

/** Uma opção do grupo de rádio. */
export type ChoiceOption<T extends string = string> = {
  /** Valor devolvido em `onChange` e comparado com `value`. */
  value: T
  /** Nome da opção, curto ("2º autor"). */
  label: string
  /** O que a escolha causa ("Conta metade"). Fica visível sempre, abaixo do nome. */
  effect?: string
}

type ChoiceRadioProps<T extends string> = {
  /** Escolha única entre poucas opções (até 5). Padrão. */
  variant?: 'radio'
  /** Pergunta que o grupo responde ("Você é qual autor do artigo?"). */
  legend: string
  /** Nome do grupo, o mesmo em todas as opções. */
  name: string
  /** Opções na ordem em que aparecem. Mais de 5, ou com número e regra, pede o ItemPicker. */
  options: ChoiceOption<T>[]
  /** Valor marcado. `undefined` ou `null` deixa tudo desmarcado, que é o padrão. */
  value?: T | null
  /** Recebe o valor da opção escolhida. */
  onChange: (value: T) => void
  /** Mensagem de erro com o próximo passo. Aparece entre a pergunta e a lista. */
  error?: string
}

type ChoiceSingleProps = {
  /** Checkbox isolado, num cartão próprio. */
  variant: 'single'
  /** Texto ao lado do controle. */
  label: string
  /** Nome do campo, quando a tela envia o formulário por ele. */
  name?: string
  checked: boolean
  /** Recebe o novo estado marcado. */
  onChange: (checked: boolean) => void
}

export type ChoiceGroupProps<T extends string = string> = ChoiceRadioProps<T> | ChoiceSingleProps

/**
 * Escolha entre poucas opções numa lista única, ou um checkbox isolado.
 *
 * @remarks
 * É controlado: nenhuma opção vem marcada, a não ser que a tela passe um `value` que a pessoa já
 * escolheu antes. Cada opção é um `label` com o `input` dentro, então a linha inteira é tocável. O
 * radio marcado ganha fundo `brand.soft`, o único fundo tingido do sistema. Só existe o checkbox
 * isolado; grupo de vários checkboxes não faz parte do catálogo.
 *
 * @example
 * ```tsx
 * <ChoiceGroup
 *   legend="Você é qual autor do artigo?"
 *   name="autoria"
 *   value={autoria}
 *   onChange={setAutoria}
 *   options={[
 *     { value: 'primeiro', label: '1º autor', effect: 'Conta a carga completa' },
 *     { value: 'segundo', label: '2º autor', effect: 'Conta metade' },
 *   ]}
 * />
 * ```
 */
export function ChoiceGroup<T extends string>(props: ChoiceGroupProps<T>): ReactNode {
  const errorId = useId()

  if (props.variant === 'single') {
    const { label, name, checked, onChange } = props

    return (
      <S.Choice layout="single">
        <S.Input
          type="checkbox"
          name={name}
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
        />
        <S.Text>{label}</S.Text>
      </S.Choice>
    )
  }

  const { legend, name, options, value, onChange, error } = props

  return (
    <S.Fieldset aria-describedby={error ? errorId : undefined}>
      <S.Legend>{legend}</S.Legend>
      {error ? <S.ErrorText id={errorId}>{error}</S.ErrorText> : null}
      <S.List>
        {options.map((option) => (
          <S.Choice key={option.value} layout="row">
            <S.Input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
            />
            <S.Text>
              {option.label}
              {option.effect ? <S.Effect>{option.effect}</S.Effect> : null}
            </S.Text>
          </S.Choice>
        ))}
      </S.List>
    </S.Fieldset>
  )
}

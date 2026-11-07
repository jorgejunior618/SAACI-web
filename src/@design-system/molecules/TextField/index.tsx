'use client'

import { useId, useState } from 'react'
import type { ComponentPropsWithRef, ReactNode } from 'react'

import * as S from './styles'

type TextFieldBaseProps = Omit<ComponentPropsWithRef<'input'>, 'children'> & {
  /** Rótulo sempre visível. Nunca troque por placeholder. */
  label: string
  /** A regra ou o porquê do campo, logo abaixo do rótulo ("Só contam as atividades a partir desse semestre"). */
  hint?: string
  /** Mensagem de erro com o próximo passo. Aparece entre o rótulo e o campo, liga `aria-invalid` e tem prioridade sobre `status`. */
  error?: string
  /** Escreve "(opcional)" no rótulo. Campo obrigatório não leva asterisco. */
  optional?: boolean
}

/**
 * Origem do valor lido do certificado. `read` pede conferência; `unread` pede que a pessoa digite e
 * exige a frase dizendo o quê.
 */
export type TextFieldStatusProps =
  | { status?: undefined; unreadMessage?: never }
  | { status: 'read'; unreadMessage?: never }
  | {
      status: 'unread'
      /** Frase dizendo o que digitar ("Não conseguimos ler a data. Digite a data em que a atividade terminou"). */
      unreadMessage: string
    }

export type TextFieldProps = TextFieldBaseProps & TextFieldStatusProps

/** Textos fixos do componente. Os que variam por campo chegam por prop. */
const TEXT = {
  optional: ' (opcional)',
  readFlag: 'Lido do certificado, confira',
  show: 'Mostrar',
  hide: 'Ocultar',
} as const

/**
 * Campo de texto com rótulo, regra e erro. Com `type="password"` ganha o botão Mostrar/Ocultar.
 *
 * @remarks
 * A ordem é fixa: rótulo, regra, erro e campo. O erro fica antes do campo para o leitor de tela
 * ouvi-lo ao chegar. Senha é este mesmo componente, não existe `PasswordField`. O campo não é
 * limpo depois de um erro. Máscara de data e horas é da tela; aqui só chega o `inputMode`. Aceita
 * `ref` como prop, então funciona com o `register` do React Hook Form.
 *
 * @example
 * ```tsx
 * <TextField
 *   label="Data em que a atividade terminou"
 *   inputMode="numeric"
 *   placeholder="dd/mm/aaaa"
 *   status="unread"
 *   unreadMessage="Não conseguimos ler a data. Digite a data em que a atividade terminou."
 * />
 * ```
 */
export function TextField({
  label,
  hint,
  error,
  optional = false,
  status,
  unreadMessage,
  id,
  type,
  'aria-describedby': describedByProp,
  ...rest
}: TextFieldProps): ReactNode {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const hintId = `${inputId}-hint`
  const errorId = `${inputId}-error`
  const flagId = `${inputId}-flag`

  const [isVisible, setIsVisible] = useState(false)
  const isPassword = type === 'password'

  // O erro manda: com ele, o selo de leitura sai de cena.
  const activeStatus = error ? undefined : status
  const state = error ? 'error' : (status ?? 'normal')
  const describedBy =
    [
      hint ? hintId : undefined,
      error ? errorId : undefined,
      activeStatus ? flagId : undefined,
      describedByProp,
    ]
      .filter(Boolean)
      .join(' ') || undefined

  const labelNode = (
    <S.Label htmlFor={inputId}>
      {label}
      {optional ? <S.Optional>{TEXT.optional}</S.Optional> : null}
    </S.Label>
  )

  return (
    <S.Root>
      {activeStatus === 'read' ? (
        <S.LabelRow>
          {labelNode}
          <S.Flag id={flagId}>{TEXT.readFlag}</S.Flag>
        </S.LabelRow>
      ) : (
        labelNode
      )}
      {hint ? <S.Hint id={hintId}>{hint}</S.Hint> : null}
      {error ? <S.ErrorText id={errorId}>{error}</S.ErrorText> : null}
      {activeStatus === 'unread' ? <S.UnreadFlag id={flagId}>{unreadMessage}</S.UnreadFlag> : null}
      <S.InputWrap>
        <S.Input
          {...rest}
          id={inputId}
          type={isPassword && isVisible ? 'text' : type}
          state={state}
          withAction={isPassword}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
        />
        {isPassword ? (
          <S.Action
            type="button"
            aria-pressed={isVisible}
            onClick={() => setIsVisible((current) => !current)}
          >
            {isVisible ? TEXT.hide : TEXT.show}
          </S.Action>
        ) : null}
      </S.InputWrap>
    </S.Root>
  )
}

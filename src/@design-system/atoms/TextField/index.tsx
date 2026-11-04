import { type ComponentProps, type ReactNode, useId } from 'react'

import * as S from './styles'

type Props = Omit<ComponentProps<'input'>, 'prefix'> & {
  label: string
  // Link ou selo à direita do rótulo ("Esqueci minha senha", "Lido do certificado, confira").
  labelAside?: ReactNode
  isOptional?: boolean
  // Texto ou conteúdo próprio (regras de senha), sempre ligado ao campo por aria-describedby.
  hint?: ReactNode
  error?: string
  // Valor sugerido pela leitura do comprovante.
  isRead?: boolean
  // A leitura não conseguiu preencher: borda tracejada e aviso âmbar.
  unreadMessage?: string
  action?: { label: string; onClick: () => void }
  leadingIcon?: ReactNode
}

// Ordem: rótulo, dica, erro e só depois o campo, para o leitor de tela e o olho chegarem juntos.
export function TextField({
  label,
  labelAside,
  isOptional,
  hint,
  error,
  isRead,
  unreadMessage,
  action,
  leadingIcon,
  id,
  ...props
}: Props): ReactNode {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const hintId = hint ? `${inputId}-hint` : undefined
  const errorId = error ? `${inputId}-error` : undefined
  const unreadId = unreadMessage && !error ? `${inputId}-unread` : undefined
  const describedBy = [hintId, errorId, unreadId].filter(Boolean).join(' ') || undefined

  return (
    <S.Field>
      <S.LabelRow>
        <S.Label htmlFor={inputId}>
          {label}
          {isOptional && <span className={S.optional}> (opcional)</span>}
        </S.Label>
        {labelAside && <S.Flag>{labelAside}</S.Flag>}
      </S.LabelRow>
      {hint && <S.Hint id={hintId}>{hint}</S.Hint>}
      {error && <S.ErrorText id={errorId}>{error}</S.ErrorText>}
      {unreadId && <S.Unread id={unreadId}>{unreadMessage}</S.Unread>}
      <S.InputWrap>
        {leadingIcon && <span className={S.leadingIcon}>{leadingIcon}</span>}
        <input
          {...props}
          id={inputId}
          className={S.input}
          data-read={isRead && !error ? true : undefined}
          data-unread={Boolean(unreadId) || undefined}
          data-has-action={Boolean(action) || undefined}
          data-has-icon={Boolean(leadingIcon) || undefined}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={describedBy}
        />
        {action && (
          <button type="button" className={S.action} onClick={action.onClick}>
            {action.label}
          </button>
        )}
      </S.InputWrap>
    </S.Field>
  )
}

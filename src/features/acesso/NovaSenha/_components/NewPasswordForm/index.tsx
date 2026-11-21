'use client'

import { valibotResolver } from '@hookform/resolvers/valibot'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useId } from 'react'
import type { ReactNode } from 'react'
import { useForm, useWatch } from 'react-hook-form'

import { Button, Notice, TextField } from '@design-system'

import { AccessHeader } from '@/features/acesso/_components/AccessHeader'
import { ExpiredLink } from '@/features/acesso/_components/ExpiredLink'
import { PasswordRules } from '@/features/acesso/_components/PasswordRules'
import { isPasswordValid } from '@/features/acesso/_components/PasswordRules/utils'
import {
  accountKeys,
  ExpiredLinkError,
  invalidateAfterPasswordUpdate,
  updatePassword,
} from '@/services/account'

import { NewPasswordSchema } from '../../schema'
import type { NewPasswordInput, NewPasswordOutput } from '../../schema'
import * as S from './styles'

export type NewPasswordFormProps = {
  /** Token do link, lido de `?token=` da URL. */
  token: string
  /** E-mail dono do link, já conferido. Aparece em "Para <e-mail>". */
  email: string
}

/**
 * Formulário da senha nova, para um link que já foi conferido.
 *
 * @remarks
 * Ao salvar, grava a sessão no cache e deixa o `SessionGate` levar a pessoa adiante. Se o link
 * vencer entre abrir a tela e salvar, mostra o `ExpiredLink`. Falha de rede não limpa a senha
 * digitada (RNF24). O botão fica desabilitado até a senha cumprir as regras, como em Criar conta.
 *
 * @example
 * ```tsx
 * <NewPasswordForm token={token} email="ana@aluno.ifce.edu.br" />
 * ```
 */
export function NewPasswordForm({ token, email }: NewPasswordFormProps): ReactNode {
  const queryClient = useQueryClient()
  const rulesId = useId()
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<NewPasswordInput, unknown, NewPasswordOutput>({
    resolver: valibotResolver(NewPasswordSchema),
    defaultValues: { password: '' },
  })
  const password = useWatch({ control, name: 'password' })

  const mutation = useMutation({
    mutationFn: ({ password: value }: NewPasswordOutput) => updatePassword(value),
    onSuccess: (session) => {
      invalidateAfterPasswordUpdate(queryClient, token)
      queryClient.setQueryData(accountKeys.session(), session)
    },
  })

  if (mutation.error instanceof ExpiredLinkError) return <ExpiredLink />

  const hasValidPassword = isPasswordValid(password)

  return (
    <S.Page>
      <AccessHeader size="sm" />

      <S.Heading>
        <S.Title>Escolha a senha nova</S.Title>
        <S.For>Para {email}</S.For>
      </S.Heading>

      <S.Form noValidate onSubmit={handleSubmit((values) => mutation.mutate(values))}>
        <S.PasswordBlock>
          <TextField
            label="Senha nova"
            type="password"
            autoComplete="new-password"
            aria-describedby={rulesId}
            error={errors.password?.message}
            {...register('password')}
          />
          <PasswordRules id={rulesId} password={password} />
        </S.PasswordBlock>

        {mutation.isError ? (
          <Notice tone="danger">
            Não conseguimos salvar agora. Confira sua internet e tente de novo. A senha continua
            aqui.
          </Notice>
        ) : null}

        <Button
          type="submit"
          block
          disabled={!hasValidPassword}
          busy={mutation.isPending || mutation.isSuccess}
          busyLabel="Salvando"
        >
          Salvar senha nova
        </Button>
      </S.Form>

      <S.Note>Ao salvar, você sai dos outros aparelhos onde estava conectado.</S.Note>
    </S.Page>
  )
}

// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

'use client'

import { valibotResolver } from '@hookform/resolvers/valibot'
import { useMutation } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useForm } from 'react-hook-form'

import { AppFrame, Button, Notice, TextField } from '@design-system'

import { AccessHeader } from '@/features/acesso/_components/AccessHeader'
import { requestPasswordReset } from '@/services/account'

import { RecoverSchema } from './schema'
import type { RecoverInput, RecoverOutput } from './schema'
import * as S from './styles'

/**
 * Tela Recuperar senha: pede o e-mail e envia o link para escolher uma senha nova.
 *
 * @remarks
 * O service responde igual com e sem conta, então a tela não revela se o e-mail existe: a frase de
 * sucesso diz "se tiver conta". O botão volta a ficar habilitado depois do envio, para pedir de novo.
 *
 * @example
 * ```tsx
 * <RecuperarSenha />
 * ```
 */
export function RecuperarSenha(): ReactNode {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RecoverInput, unknown, RecoverOutput>({
    resolver: valibotResolver(RecoverSchema),
    defaultValues: { email: '' },
  })

  const mutation = useMutation({
    mutationFn: ({ email }: RecoverOutput) => requestPasswordReset(email),
  })

  return (
    <AppFrame>
      <S.Page>
        <AccessHeader size="sm" />

        <S.Heading>
          <S.Title>Criar uma nova senha</S.Title>
          <S.Intro>
            Mandamos um link para o seu e-mail de aluno. Pelo link, você escolhe a senha nova.
          </S.Intro>
        </S.Heading>

        <S.Form noValidate onSubmit={handleSubmit((values) => mutation.mutate(values))}>
          <TextField
            label="E-mail de aluno"
            hint="O que termina em @aluno.ifce.edu.br"
            type="email"
            inputMode="email"
            autoComplete="email"
            error={errors.email?.message}
            {...register('email')}
          />

          <Button type="submit" block busy={mutation.isPending} busyLabel="Enviando">
            Enviar link
          </Button>

          {mutation.isSuccess ? (
            <Notice tone="success">
              Se este e-mail tiver conta, o link chega em instantes. Olhe também no spam.
            </Notice>
          ) : null}
          {mutation.isError ? (
            <Notice tone="danger">
              Não conseguimos enviar agora. Confira sua internet e tente de novo. O e-mail continua
              aqui.
            </Notice>
          ) : null}
        </S.Form>
      </S.Page>
    </AppFrame>
  )
}

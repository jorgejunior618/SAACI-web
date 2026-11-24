// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

'use client'

import { valibotResolver } from '@hookform/resolvers/valibot'
import { useMutation } from '@tanstack/react-query'
import NextLink from 'next/link'
import { useRouter } from 'next/navigation'
import { useId } from 'react'
import type { ReactNode } from 'react'
import { useForm, useWatch } from 'react-hook-form'

import { AppFrame, Button, Link, Notice, TextField } from '@design-system'

import { AccessHeader } from '@/features/acesso/_components/AccessHeader'
import { PasswordRules } from '@/features/acesso/_components/PasswordRules'
import { isPasswordValid } from '@/features/acesso/_components/PasswordRules/utils'
import { createAccount, EmailAlreadyRegisteredError, EmailDomainError } from '@/services/account'

import { SignUpSchema } from './schema'
import type { SignUpInput, SignUpOutput } from './schema'
import * as S from './styles'

const PASSWORD_HINT = 'Pelo menos 8 caracteres, com uma letra e um número.'

/**
 * Tela Criar conta: e-mail de aluno e senha.
 *
 * @remarks
 * Não abre sessão: depois de criar, leva a Confirme seu e-mail com o e-mail na query string. O botão
 * fica desabilitado até a senha cumprir as regras, como no protótipo. E-mail que já tem conta
 * mostra um bloco com os caminhos para Entrar e para criar uma nova senha.
 *
 * @example
 * ```tsx
 * <CriarConta />
 * ```
 */
export function CriarConta(): ReactNode {
  const router = useRouter()
  const rulesId = useId()

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<SignUpInput, unknown, SignUpOutput>({
    resolver: valibotResolver(SignUpSchema),
    defaultValues: { email: '', password: '' },
  })
  const password = useWatch({ control, name: 'password' })

  const mutation = useMutation({
    mutationFn: ({ email, password: value }: SignUpOutput) => createAccount(email, value),
    onSuccess: (_, { email }) => {
      router.push(`/confirme-email?email=${encodeURIComponent(email)}`)
    },
  })

  const isAlreadyRegistered = mutation.error instanceof EmailAlreadyRegisteredError
  const hasOtherFailure =
    mutation.isError && !isAlreadyRegistered && !(mutation.error instanceof EmailDomainError)
  const emailError =
    mutation.error instanceof EmailDomainError ? mutation.error.message : errors.email?.message
  const hasValidPassword = isPasswordValid(password)
  const isRulesVisible = password.length > 0 && !isAlreadyRegistered

  return (
    <AppFrame>
      <S.Page>
        <AccessHeader size="sm" />

        <S.Heading>
          <S.Title>Criar conta</S.Title>
          <S.Intro>Só o e-mail de aluno e uma senha. Curso e semestre vêm depois.</S.Intro>
        </S.Heading>

        {isAlreadyRegistered ? (
          <Notice
            format="block"
            title="Este e-mail já tem uma conta"
            actions={
              <>
                <Link as={NextLink} href="/entrar">
                  Entrar
                </Link>
                <Link as={NextLink} href="/recuperar-senha">
                  Criar uma nova senha
                </Link>
              </>
            }
          >
            É só entrar com a sua senha. Se não lembrar, crie uma nova pelo link que vai para o seu
            e-mail.
          </Notice>
        ) : null}

        <S.Form noValidate onSubmit={handleSubmit((values) => mutation.mutate(values))}>
          <S.Fields>
            <TextField
              label="E-mail de aluno"
              hint="O que termina em @aluno.ifce.edu.br"
              type="email"
              inputMode="email"
              autoComplete="email"
              error={emailError}
              {...register('email')}
            />
            <S.PasswordBlock>
              <TextField
                label="Crie uma senha"
                hint={isRulesVisible ? undefined : PASSWORD_HINT}
                type="password"
                autoComplete="new-password"
                aria-describedby={isRulesVisible ? rulesId : undefined}
                error={errors.password?.message}
                {...register('password')}
              />
              {isRulesVisible ? <PasswordRules id={rulesId} password={password} /> : null}
            </S.PasswordBlock>
          </S.Fields>

          {hasOtherFailure ? (
            <Notice tone="danger">
              Não conseguimos criar a conta agora. Confira sua internet e tente de novo. O que você
              digitou continua aqui.
            </Notice>
          ) : null}

          <Button
            type="submit"
            block
            disabled={!hasValidPassword}
            busy={mutation.isPending || mutation.isSuccess}
            busyLabel="Criando"
          >
            Criar conta
          </Button>
        </S.Form>

        <S.Privacy>
          Ao criar, você concorda com o <Link href="#">aviso de privacidade</Link>.
        </S.Privacy>
      </S.Page>
    </AppFrame>
  )
}

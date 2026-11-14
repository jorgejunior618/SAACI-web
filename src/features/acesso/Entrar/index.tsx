'use client'

import { valibotResolver } from '@hookform/resolvers/valibot'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import NextLink from 'next/link'
import { useRouter } from 'next/navigation'
import type { ReactNode } from 'react'
import { useForm } from 'react-hook-form'

import { AppFrame, Button, Link, Notice, TextField } from '@design-system'

import { AccessHeader } from '@/features/acesso/_components/AccessHeader'
import {
  accountKeys,
  EmailNotConfirmedError,
  InvalidCredentialsError,
  signIn,
} from '@/services/account'

import { SignInSchema } from './schema'
import type { SignInInput, SignInOutput } from './schema'
import * as S from './styles'

const CREDENTIALS_ERROR = 'A senha não confere. Confira o Caps Lock e tente de novo.'

/**
 * Tela Entrar: e-mail e senha.
 *
 * @remarks
 * Ao entrar, só grava a sessão no cache. Quem leva a pessoa para o painel é o `SessionGate` do grupo
 * `(publico)`, que percebe a sessão. E-mail ainda não confirmado segue para Confirme seu e-mail. O
 * que a pessoa digitou nunca é limpo depois de um erro (RNF24).
 *
 * @example
 * ```tsx
 * <Entrar />
 * ```
 */
export function Entrar(): ReactNode {
  const router = useRouter()
  const queryClient = useQueryClient()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInInput, unknown, SignInOutput>({ resolver: valibotResolver(SignInSchema) })

  const mutation = useMutation({
    mutationFn: ({ email, password }: SignInOutput) => signIn(email, password),
    onSuccess: (session) => {
      queryClient.setQueryData(accountKeys.session(), session)
    },
    onError: (error, { email }) => {
      if (error instanceof EmailNotConfirmedError) {
        router.push(`/confirme-email?email=${encodeURIComponent(email)}&from=sign-in`)
      }
    },
  })

  const hasWrongCredentials = mutation.error instanceof InvalidCredentialsError
  const hasOtherFailure =
    mutation.isError && !hasWrongCredentials && !(mutation.error instanceof EmailNotConfirmedError)
  const passwordError = hasWrongCredentials ? CREDENTIALS_ERROR : errors.password?.message

  return (
    <AppFrame>
      <S.Page>
        <AccessHeader size="lg" />
        <S.Intro>Registre seus certificados e veja quantas horas complementares faltam.</S.Intro>

        <S.Form noValidate onSubmit={handleSubmit((values) => mutation.mutate(values))}>
          <S.Fields>
            <TextField
              label="E-mail de aluno"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="nome@aluno.ifce.edu.br"
              error={errors.email?.message}
              {...register('email')}
            />
            <S.PasswordBlock>
              <TextField
                label="Senha"
                type="password"
                autoComplete="current-password"
                error={passwordError}
                {...register('password')}
              />
              {hasWrongCredentials ? (
                <S.HelpLine>
                  Não lembra?{' '}
                  <Link as={NextLink} href="/recuperar-senha">
                    Crie uma nova senha
                  </Link>{' '}
                  em dois minutos.
                </S.HelpLine>
              ) : (
                <Link as={NextLink} href="/recuperar-senha" isStandalone>
                  Esqueci minha senha
                </Link>
              )}
            </S.PasswordBlock>
          </S.Fields>

          {hasOtherFailure ? (
            <Notice tone="danger">
              Não conseguimos entrar agora. Confira sua internet e tente de novo. O que você digitou
              continua aqui.
            </Notice>
          ) : null}

          <Button
            type="submit"
            block
            busy={mutation.isPending || mutation.isSuccess}
            busyLabel="Entrando"
          >
            Entrar
          </Button>
        </S.Form>

        <S.Footer>
          <S.Question>Primeira vez aqui?</S.Question>
          <Button as={NextLink} href="/criar-conta" variant="secondary" block>
            Criar conta
          </Button>
        </S.Footer>
      </S.Page>
    </AppFrame>
  )
}

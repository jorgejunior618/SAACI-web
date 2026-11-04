'use client'

import { valibotResolver } from '@hookform/resolvers/valibot'
import { useMutation } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useForm } from 'react-hook-form'

import {
  Button,
  LogoCompleto,
  Notice,
  PageHeader,
  Screen,
  TextField,
  TextLink,
  TopBar,
} from '@design-system'

import { ROUTES } from '@/constants/routes'
import { pedirNovaSenha } from '@/services/conta'

import { type RecuperarSenhaForm, RecuperarSenhaSchema } from './schema'
import * as S from './styles'

export function RecuperarSenha(): ReactNode {
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<RecuperarSenhaForm>({ resolver: valibotResolver(RecuperarSenhaSchema) })

  const mutation = useMutation({
    mutationFn: ({ email }: RecuperarSenhaForm) => pedirNovaSenha(email),
  })

  return (
    <Screen
      topBar={
        <TopBar variant="back" title="" backHref={ROUTES.login} backLabel="Voltar para Entrar" />
      }
    >
      <S.Header>
        <LogoCompleto width={144} />
        <PageHeader
          title="Criar uma nova senha"
          lead="Mandamos um link para o seu e-mail de aluno. Pelo link, você escolhe a senha nova."
        />
      </S.Header>

      {mutation.isSuccess && (
        <Notice
          title="Link enviado"
          tone="success"
          role="status"
          actions={
            // O mock não manda e-mail: este link faz o papel de abrir o que chegou na caixa.
            <TextLink href={ROUTES.redefinirSenha}>Abrir o link (simulação)</TextLink>
          }
        >
          Se {getValues('email')} tiver conta, o link chega em instantes. Se não achar, olhe no spam
          e na lixeira.
        </Notice>
      )}
      {mutation.isError && (
        <Notice title="O link não foi enviado" tone="danger" role="alert">
          Confira sua internet e tente de novo.
        </Notice>
      )}

      <S.Form noValidate onSubmit={handleSubmit((dados) => mutation.mutate(dados))}>
        <TextField
          label="E-mail de aluno"
          hint="O que termina em @aluno.ifce.edu.br"
          type="email"
          autoComplete="username"
          inputMode="email"
          placeholder="nome@aluno.ifce.edu.br"
          error={errors.email?.message}
          {...register('email')}
        />
        <Button type="submit" isBlock isLoading={mutation.isPending}>
          {mutation.isPending ? 'Enviando' : mutation.isSuccess ? 'Enviar de novo' : 'Enviar link'}
        </Button>
      </S.Form>
    </Screen>
  )
}

'use client'

import { valibotResolver } from '@hookform/resolvers/valibot'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import type { ReactNode } from 'react'
import { useForm } from 'react-hook-form'

import { Button, LogoCompleto, Screen, TextField } from '@design-system'

import { destinoDaSessao } from '@/components/SessionGate'
import { useMostrarSenha } from '@/hooks/useMostrarSenha'
import { contaKeys, entrar, SenhaNaoConfereError } from '@/services/conta'

import { type LoginForm, LoginSchema } from './schema'
import * as S from './styles'

export function Login(): ReactNode {
  const router = useRouter()
  const queryClient = useQueryClient()
  const senhaInput = useMostrarSenha()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginForm>({ resolver: valibotResolver(LoginSchema) })

  const mutation = useMutation({
    mutationFn: ({ email, senha }: LoginForm) => entrar(email, senha),
    onSuccess: (sessao) => {
      queryClient.setQueryData(contaKeys.sessao(), sessao)
      router.replace(destinoDaSessao(sessao))
    },
    onError: (error) => {
      setError('senha', {
        message:
          error instanceof SenhaNaoConfereError
            ? 'A senha não confere com este e-mail. Confira se o Caps Lock está ligado e tente de novo.'
            : 'Não deu para entrar agora. Confira sua internet e tente de novo.',
      })
    },
  })

  return (
    <Screen label="Entrar">
      <S.Header>
        <LogoCompleto width={216} />
        <S.Tagline>
          Registre seus certificados e veja quantas horas complementares faltam.
        </S.Tagline>
      </S.Header>

      <S.Form noValidate onSubmit={handleSubmit((dados) => mutation.mutate(dados))}>
        <TextField
          label="E-mail de aluno"
          type="email"
          autoComplete="username"
          inputMode="email"
          placeholder="nome@aluno.ifce.edu.br"
          error={errors.email?.message}
          {...register('email')}
        />
        <TextField
          label="Senha"
          autoComplete="current-password"
          error={errors.senha?.message}
          {...senhaInput}
          {...register('senha')}
        />
        <Button type="submit" isBlock isLoading={mutation.isPending}>
          {mutation.isPending ? 'Entrando' : 'Entrar'}
        </Button>
      </S.Form>
    </Screen>
  )
}

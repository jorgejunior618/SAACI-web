'use client'

import { valibotResolver } from '@hookform/resolvers/valibot'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import type { ReactNode } from 'react'
import { useForm, useWatch } from 'react-hook-form'

import {
  Button,
  LogoCompleto,
  Notice,
  PageHeader,
  PasswordRules,
  Screen,
  TextField,
  TextLink,
  TopBar,
} from '@design-system'

import { ROUTES } from '@/constants/routes'
import { useMostrarSenha } from '@/hooks/useMostrarSenha'
import { EmailJaCadastradoError, contaKeys, criarConta } from '@/services/conta'
import { avaliarSenha } from '@/utils/validacoes'

import { type CadastroForm, CadastroSchema } from './schema'
import * as S from './styles'

export function Cadastro(): ReactNode {
  const router = useRouter()
  const queryClient = useQueryClient()
  const senhaInput = useMostrarSenha()
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<CadastroForm>({
    resolver: valibotResolver(CadastroSchema),
    defaultValues: { email: '', senha: '' },
  })
  const senha = useWatch({ control, name: 'senha' })

  const mutation = useMutation({
    mutationFn: ({ email, senha }: CadastroForm) => criarConta(email, senha),
    onSuccess: (sessao) => {
      queryClient.setQueryData(contaKeys.sessao(), sessao)
      router.replace(ROUTES.verificacao)
    },
    onError: (error) => {
      if (!(error instanceof EmailJaCadastradoError)) {
        setError('root', {
          message: 'Não deu para criar a conta agora. Confira sua internet e tente de novo.',
        })
      }
    },
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
          title="Criar conta"
          lead="Só o e-mail de aluno e uma senha. Curso e semestre vêm depois."
        />
      </S.Header>

      {mutation.error instanceof EmailJaCadastradoError && (
        <Notice
          title="Este e-mail já tem uma conta"
          role="alert"
          actions={
            <>
              <TextLink href={ROUTES.login}>Entrar</TextLink>
              <TextLink href={ROUTES.recuperarSenha}>Criar uma nova senha</TextLink>
            </>
          }
        >
          É só entrar com a sua senha. Se não lembrar, crie uma nova pelo link que vai para o seu
          e-mail.
        </Notice>
      )}
      {errors.root && (
        <Notice title="A conta não foi criada" tone="danger" role="alert">
          {errors.root.message}
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
        <TextField
          label="Crie uma senha"
          hint={<PasswordRules password={senha} />}
          autoComplete="new-password"
          error={errors.senha?.message}
          {...senhaInput}
          {...register('senha')}
        />
        <Button
          type="submit"
          isBlock
          disabled={!avaliarSenha(senha).isValida}
          isLoading={mutation.isPending}
        >
          {mutation.isPending ? 'Criando conta' : 'Criar conta'}
        </Button>
        <S.Terms>
          Ao criar, você concorda com o{' '}
          <TextLink href={ROUTES.privacidade}>aviso de privacidade</TextLink>.
        </S.Terms>
      </S.Form>
    </Screen>
  )
}

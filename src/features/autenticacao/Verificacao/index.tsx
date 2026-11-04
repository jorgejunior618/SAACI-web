'use client'

import { valibotResolver } from '@hookform/resolvers/valibot'
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { type ReactNode, useState } from 'react'
import { useForm } from 'react-hook-form'

import {
  Button,
  InlineMessage,
  Notice,
  PageHeader,
  Screen,
  TextButton,
  TextField,
} from '@design-system'

import { RodapeConta } from '@/components/RodapeConta'
import { useAgora } from '@/hooks/useAgora'
import {
  contaQueries,
  corrigirEmail,
  invalidateAfterContaWrite,
  reenviarLink,
} from '@/services/conta'

import { type CorrigirEmailForm, CorrigirEmailSchema } from './schema'
import * as S from './styles'

// Intervalo mínimo entre um reenvio e outro (RF39).
const ESPERA_REENVIO_MS = 45_000

const formatContagem = (ms: number): string => {
  const segundos = Math.ceil(ms / 1000)
  return `${Math.floor(segundos / 60)}:${String(segundos % 60).padStart(2, '0')}`
}

export function Verificacao(): ReactNode {
  const queryClient = useQueryClient()
  const { data: sessao } = useSuspenseQuery(contaQueries.sessao())
  const agora = useAgora()
  const [isCorrigindo, setIsCorrigindo] = useState(false)
  const [aviso, setAviso] = useState<string | null>(null)

  const restante = sessao ? Date.parse(sessao.linkEnviadoEm) + ESPERA_REENVIO_MS - agora : 0

  const reenvio = useMutation({
    mutationFn: reenviarLink,
    onSuccess: () => {
      invalidateAfterContaWrite(queryClient)
      setAviso(`Link reenviado para ${sessao?.email}. Se não achar, olhe no spam e na lixeira.`)
    },
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CorrigirEmailForm>({ resolver: valibotResolver(CorrigirEmailSchema) })

  const correcao = useMutation({
    mutationFn: ({ email }: CorrigirEmailForm) => corrigirEmail(email),
    onSuccess: (_, { email }) => {
      invalidateAfterContaWrite(queryClient)
      setIsCorrigindo(false)
      setAviso(`E-mail corrigido. O link novo foi para ${email}.`)
    },
  })

  // O SessionGate só deixa chegar aqui com sessão de e-mail não confirmado.
  if (!sessao) return null

  return (
    <Screen>
      <S.Top>
        <Notice title="Para entrar, falta confirmar o seu e-mail." tone="warning" />
      </S.Top>

      <PageHeader
        title="Confirme seu e-mail"
        lead={
          <>
            <p>Enviamos um link para</p>
            <S.Email>{sessao.email}</S.Email>
          </>
        }
      />
      <p>
        Abra a caixa do e-mail institucional e toque no link. Se não achar, olhe no spam e na
        lixeira.
      </p>

      <S.Actions>
        <Button
          variant="secondary"
          isBlock
          disabled={restante > 0}
          isLoading={reenvio.isPending}
          onClick={() => reenvio.mutate()}
        >
          {reenvio.isPending
            ? 'Reenviando'
            : restante > 0
              ? `Reenviar link em ${formatContagem(restante)}`
              : 'Reenviar link'}
        </Button>
        {aviso && (
          <InlineMessage tone="success" role="status">
            {aviso}
          </InlineMessage>
        )}
        {reenvio.isError && (
          <InlineMessage tone="danger" role="alert">
            O link não foi reenviado. Confira sua internet e tente de novo.
          </InlineMessage>
        )}

        {isCorrigindo ? (
          <S.Form noValidate onSubmit={handleSubmit((dados) => correcao.mutate(dados))}>
            <TextField
              label="E-mail de aluno"
              hint="O link de confirmação vai para o e-mail novo."
              type="email"
              autoComplete="username"
              inputMode="email"
              error={
                errors.email?.message ??
                (correcao.isError ? 'Não deu para corrigir agora. Tente de novo.' : undefined)
              }
              {...register('email')}
            />
            <S.FormButtons>
              <Button
                variant="secondary"
                onClick={() => {
                  setIsCorrigindo(false)
                  reset()
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" isLoading={correcao.isPending}>
                {correcao.isPending ? 'Salvando' : 'Salvar'}
              </Button>
            </S.FormButtons>
          </S.Form>
        ) : (
          <TextButton
            onClick={() => {
              reset({ email: sessao.email })
              setIsCorrigindo(true)
            }}
          >
            Digitei o e-mail errado
          </TextButton>
        )}
      </S.Actions>

      <Notice title="Não consegue abrir o e-mail institucional?">
        Peça o acesso ao setor responsável pelo e-mail no seu campus. Reenviar o link não resolve
        esse caso.
      </Notice>

      <S.Footer>
        <RodapeConta sessao={sessao} />
      </S.Footer>
    </Screen>
  )
}

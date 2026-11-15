'use client'

import { valibotResolver } from '@hookform/resolvers/valibot'
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import NextLink from 'next/link'
import { useRouter } from 'next/navigation'
import type { ReactNode } from 'react'
import { useForm } from 'react-hook-form'

import { AppFrame, Button, Notice, TextField, TopBar } from '@design-system'

import { clearSessionCache, deleteAccount, InvalidCredentialsError } from '@/services/account'
import { profileQueries } from '@/services/profile'

import { DeleteAccountSchema } from './schema'
import type { DeleteAccountInput, DeleteAccountOutput } from './schema'
import * as S from './styles'

const PASSWORD_ERROR = 'A senha não confere. Confira o Caps Lock e tente de novo.'

/**
 * Tela Excluir conta: confirma com a senha e apaga a conta, as atividades e os comprovantes.
 *
 * @remarks
 * Ao apagar, esvazia o cache (RNF04) e leva para Conta apagada. "Manter minha conta" e o Voltar
 * levam a Perfil, para quem já tem curso, ou a Seu curso, para quem ainda não escolheu. Senha errada
 * aparece no campo. Qualquer outra falha diz que a conta continua como estava. O que a pessoa
 * digitou nunca é limpo depois de um erro (RNF24). A página envolve este componente em `Suspense`,
 * porque lê o perfil com `useSuspenseQuery` para decidir a volta.
 *
 * @example
 * ```tsx
 * <Suspense fallback={<LoadingState label="Buscando seus dados" />}>
 *   <ExcluirConta />
 * </Suspense>
 * ```
 */
export function ExcluirConta(): ReactNode {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { data: profile } = useSuspenseQuery(profileQueries.detail())
  const backHref = profile.courseId === null ? '/seu-curso' : '/perfil'
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DeleteAccountInput, unknown, DeleteAccountOutput>({
    resolver: valibotResolver(DeleteAccountSchema),
  })

  const mutation = useMutation({
    mutationFn: ({ password }: DeleteAccountOutput) => deleteAccount(password),
    onSuccess: () => {
      clearSessionCache(queryClient)
      router.replace('/conta-apagada')
    },
  })

  const hasWrongPassword = mutation.error instanceof InvalidCredentialsError
  const hasOtherFailure = mutation.isError && !hasWrongPassword

  return (
    <AppFrame
      topBar={
        <TopBar variant="inner" title="Excluir conta" backHref={backHref} linkAs={NextLink} />
      }
    >
      <S.Page noValidate onSubmit={handleSubmit((values) => mutation.mutate(values))}>
        <S.Consequence>
          Isso apaga sua conta, suas atividades e seus comprovantes. Não dá para desfazer.
        </S.Consequence>

        {/* TODO: o download em lote dos comprovantes não existe no service (só `getProofUrl` por
            atividade). Troque o marcador por um link quando houver. */}
        <Notice>Antes de apagar, baixe seus comprovantes: [DOWNLOAD DOS COMPROVANTES].</Notice>

        <TextField
          label="Confirme com sua senha"
          type="password"
          autoComplete="current-password"
          error={hasWrongPassword ? PASSWORD_ERROR : errors.password?.message}
          {...register('password')}
        />

        {hasOtherFailure ? (
          <Notice tone="danger">
            Não conseguimos excluir agora. Confira sua internet e tente de novo. Sua conta continua
            como estava.
          </Notice>
        ) : null}

        <S.Actions>
          <Button
            type="submit"
            variant="danger"
            block
            busy={mutation.isPending || mutation.isSuccess}
            busyLabel="Excluindo"
          >
            Excluir minha conta
          </Button>
          <Button as={NextLink} href={backHref} variant="secondary" block>
            Manter minha conta
          </Button>
        </S.Actions>
      </S.Page>
    </AppFrame>
  )
}

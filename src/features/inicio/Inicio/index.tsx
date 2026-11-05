'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import type { ReactNode } from 'react'

import { Button, InlineMessage, LogoCompleto, Screen } from '@design-system'

import { ROUTES } from '@/constants/routes'
import { contaKeys, sair } from '@/services/conta'

import * as S from './styles'

// Ponto de chegada depois de entrar, enquanto as telas do app não existem.
export function Inicio(): ReactNode {
  const router = useRouter()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: sair,
    onSuccess: () => {
      queryClient.setQueryData(contaKeys.sessao(), null)
      router.replace(ROUTES.login)
    },
  })

  return (
    <Screen label="Início" isCentered>
      <S.Content>
        <LogoCompleto width={216} />
        <Button
          variant="secondary"
          isBlock
          isLoading={mutation.isPending}
          onClick={() => mutation.mutate()}
        >
          {mutation.isPending ? 'Saindo' : 'Sair'}
        </Button>
        {mutation.isError && (
          <InlineMessage tone="danger" role="alert">
            Não deu para sair agora. Confira sua internet e tente de novo.
          </InlineMessage>
        )}
      </S.Content>
    </Screen>
  )
}

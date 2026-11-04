'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { type ReactNode, useState } from 'react'

import { TextButton } from '@design-system'

import { ApagarContaSheet } from '@/components/ApagarContaSheet'
import { ROUTES } from '@/constants/routes'
import { type Sessao, sair } from '@/services/conta'

import * as S from './styles'

// "Sair · Excluir conta", nas telas antes do painel (Confirme seu e-mail e Seu curso).
export function RodapeConta({ sessao }: { sessao: Sessao }): ReactNode {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [isApagando, setIsApagando] = useState(false)

  const saida = useMutation({
    mutationFn: sair,
    onSuccess: () => {
      router.replace(ROUTES.login)
      queryClient.clear()
    },
  })

  return (
    <>
      <S.Row>
        <TextButton onClick={() => saida.mutate()} disabled={saida.isPending}>
          {saida.isPending ? 'Saindo' : 'Sair'}
        </TextButton>
        <TextButton tone="muted" onClick={() => setIsApagando(true)}>
          Excluir conta
        </TextButton>
      </S.Row>
      <ApagarContaSheet
        isOpen={isApagando}
        onClose={() => setIsApagando(false)}
        email={sessao.email}
        isConfirmada={sessao.isEmailConfirmado}
        totalAtividades={0}
      />
    </>
  )
}

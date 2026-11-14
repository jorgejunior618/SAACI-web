'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import NextLink from 'next/link'
import { useRouter } from 'next/navigation'
import type { ReactNode } from 'react'

import { Link, Notice } from '@design-system'

import { clearSessionCache, signOut } from '@/services/account'

import * as S from './styles'

/**
 * Saídas da conta que ficam no pé da tela Seu curso: Sair e Excluir conta.
 *
 * @remarks
 * Sair encerra a sessão, esvazia o cache (RNF04) e leva para Entrar. Excluir conta só navega para a
 * tela própria, que pede a senha. Se o Sair falhar, uma frase diz o que fazer e a pessoa continua na
 * tela.
 *
 * @example
 * ```tsx
 * <AccountLinks />
 * ```
 */
export function AccountLinks(): ReactNode {
  const router = useRouter()
  const queryClient = useQueryClient()

  const signOutMutation = useMutation({
    mutationFn: signOut,
    onSuccess: () => {
      clearSessionCache(queryClient)
      router.replace('/entrar')
    },
  })

  return (
    <S.Root>
      <S.Row>
        <Link
          as="button"
          type="button"
          isStandalone
          aria-busy={signOutMutation.isPending}
          onClick={() => {
            if (!signOutMutation.isPending) signOutMutation.mutate()
          }}
        >
          {signOutMutation.isPending ? 'Saindo' : 'Sair'}
        </Link>
        <Link as={NextLink} href="/excluir-conta" isStandalone>
          Excluir conta
        </Link>
      </S.Row>
      {signOutMutation.isError ? (
        <Notice tone="danger">
          Não conseguimos sair agora. Confira sua internet e toque em Sair de novo.
        </Notice>
      ) : null}
    </S.Root>
  )
}

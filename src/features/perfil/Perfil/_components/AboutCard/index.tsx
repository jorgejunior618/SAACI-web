'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ChevronRight } from 'lucide-react'
import NextLink from 'next/link'
import { useRouter } from 'next/navigation'
import type { ReactNode } from 'react'

import { Icon, Notice } from '@design-system'

import { clearSessionCache, signOut } from '@/services/account'

import * as S from './styles'

/**
 * Cartão "Sobre o SAACI" do Perfil: o aviso de privacidade e o Sair.
 *
 * @remarks
 * Sair encerra a sessão, esvazia o cache (RNF04) e leva para Entrar. Se falhar, uma frase diz o que
 * fazer e a pessoa continua na tela. A mesma mutation existe no `AccountLinks`, que o Seu curso usa
 * com outro desenho; são oito linhas e cada tela pede um visual, então não viraram um hook.
 *
 * @example
 * ```tsx
 * <AboutCard />
 * ```
 */
export function AboutCard(): ReactNode {
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
      <S.Title>Sobre o SAACI</S.Title>
      <S.List>
        <S.RowLink as={NextLink} href="/privacidade">
          <span>Aviso de privacidade</span>
          <S.Chevron>
            <Icon icon={ChevronRight} size="sm" />
          </S.Chevron>
        </S.RowLink>
        <S.RowButton
          type="button"
          aria-busy={signOutMutation.isPending}
          onClick={() => {
            if (!signOutMutation.isPending) signOutMutation.mutate()
          }}
        >
          {signOutMutation.isPending ? 'Saindo' : 'Sair'}
        </S.RowButton>
      </S.List>
      {signOutMutation.isError ? (
        <Notice tone="danger">
          Não conseguimos sair agora. Confira sua internet e toque em Sair de novo.
        </Notice>
      ) : null}
    </S.Root>
  )
}

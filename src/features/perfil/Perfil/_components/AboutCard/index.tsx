'use client'

import { ChevronRight } from 'lucide-react'
import NextLink from 'next/link'
import type { ReactNode } from 'react'

import { Icon, Notice } from '@design-system'

import { useSignOut } from '@/hooks/use-sign-out'

import * as S from './styles'

/**
 * Cartão "Sobre o SAACI" do Perfil: o aviso de privacidade e o Sair.
 *
 * @remarks
 * Sair usa `useSignOut`: encerra a sessão, esvazia o cache (RNF04) e leva para Entrar. Se falhar, uma
 * frase diz o que fazer e a pessoa continua na tela. O Seu curso usa o mesmo hook com outro desenho.
 *
 * @example
 * ```tsx
 * <AboutCard />
 * ```
 */
export function AboutCard(): ReactNode {
  const signOutMutation = useSignOut()

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

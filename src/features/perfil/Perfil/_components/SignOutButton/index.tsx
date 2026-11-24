// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

'use client'

import type { ReactNode } from 'react'

import { Notice } from '@design-system'

import { useSignOut } from '@/hooks/use-sign-out'

import * as S from './styles'

/**
 * Botão Sair do Perfil, abaixo do separador e acima do Apagar minha conta.
 *
 * @remarks
 * Usa `useSignOut`: encerra a sessão, esvazia o cache (RNF04) e leva para Entrar. Se falhar, uma
 * frase diz o que fazer e a pessoa continua na tela. O Seu curso usa o mesmo hook com outro desenho.
 *
 * @example
 * ```tsx
 * <SignOutButton />
 * ```
 */
export function SignOutButton(): ReactNode {
  const signOutMutation = useSignOut()

  return (
    <S.Root>
      <S.Action
        type="button"
        aria-busy={signOutMutation.isPending}
        onClick={() => {
          if (!signOutMutation.isPending) signOutMutation.mutate()
        }}
      >
        {signOutMutation.isPending ? 'Saindo' : 'Sair'}
      </S.Action>
      {signOutMutation.isError ? (
        <Notice tone="danger">
          Não conseguimos sair agora. Confira sua internet e toque em Sair de novo.
        </Notice>
      ) : null}
    </S.Root>
  )
}

// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

'use client'

import NextLink from 'next/link'
import type { ReactNode } from 'react'

import { Link, Notice } from '@design-system'

import { useSignOut } from '@/hooks/use-sign-out'

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
  const signOutMutation = useSignOut()

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

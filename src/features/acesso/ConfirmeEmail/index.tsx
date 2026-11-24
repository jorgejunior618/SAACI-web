// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import type { ReactNode } from 'react'

import { AppFrame, LoadingState } from '@design-system'

import { ConfirmingLink } from './_components/ConfirmingLink'
import { PendingConfirmation } from './_components/PendingConfirmation'

export type ConfirmeEmailProps = {
  /** Token do link de confirmação (`?token=`). Com ele, a tela confirma o e-mail na hora. */
  token?: string
  /** E-mail que recebeu o link (`?email=`). Sem token e sem e-mail, a tela leva a Entrar. */
  email?: string
  /** Origem da visita (`?from=`). `sign-in` mostra o aviso de que falta confirmar para entrar. */
  from?: string
}

/**
 * Tela Confirme seu e-mail, com dois modos escolhidos pelos parâmetros da URL.
 *
 * @remarks
 * Com `token`, confirma o link e abre a sessão (`ConfirmingLink`). Sem `token`, mostra o aviso de
 * link enviado e o reenvio (`PendingConfirmation`). Sem nenhum dos dois não há o que mostrar, então
 * leva a Entrar.
 *
 * @example
 * ```tsx
 * <ConfirmeEmail email="ana@aluno.ifce.edu.br" from="sign-in" />
 * ```
 */
export function ConfirmeEmail({ token, email, from }: ConfirmeEmailProps): ReactNode {
  const router = useRouter()
  const hasNothingToShow = !token && !email

  useEffect(() => {
    if (hasNothingToShow) router.replace('/entrar')
  }, [hasNothingToShow, router])

  return (
    <AppFrame>
      {token ? (
        <ConfirmingLink token={token} />
      ) : email ? (
        <PendingConfirmation email={email} isFromSignIn={from === 'sign-in'} />
      ) : (
        <LoadingState label="Levando você para Entrar" />
      )}
    </AppFrame>
  )
}

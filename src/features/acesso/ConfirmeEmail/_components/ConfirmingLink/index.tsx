// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'

import { Button, LoadingState, StateScreen } from '@design-system'

import { ExpiredLink } from '@/features/acesso/_components/ExpiredLink'
import { accountKeys, confirmEmail, ExpiredLinkError } from '@/services/account'

export type ConfirmingLinkProps = {
  /** Token do link recebido por e-mail, lido de `?token=` da URL. */
  token: string
}

/**
 * Confirma o e-mail pelo link assim que a tela abre.
 *
 * @remarks
 * Grava a sessão no cache e deixa o `SessionGate` levar a pessoa adiante. O `useRef` impede o
 * segundo disparo do efeito no StrictMode: o link vale uma vez, e o segundo uso cairia em "vencido".
 * Link vencido mostra o `ExpiredLink`. Falha de rede deixa tentar de novo.
 *
 * @example
 * ```tsx
 * <ConfirmingLink token={token} />
 * ```
 */
export function ConfirmingLink({ token }: ConfirmingLinkProps): ReactNode {
  const queryClient = useQueryClient()
  const hasStarted = useRef(false)

  const mutation = useMutation({
    mutationFn: confirmEmail,
    onSuccess: (session) => {
      queryClient.setQueryData(accountKeys.session(), session)
    },
  })
  const { mutate } = mutation

  useEffect(() => {
    if (hasStarted.current) return
    hasStarted.current = true
    mutate(token)
  }, [mutate, token])

  if (mutation.error instanceof ExpiredLinkError) return <ExpiredLink />

  if (mutation.isError) {
    return (
      <StateScreen
        variant="connectionError"
        title="Não deu para confirmar agora"
        description="Confira sua internet e tente de novo. O link continua valendo."
        actions={
          <Button variant="secondary" block onClick={() => mutate(token)}>
            Tentar de novo
          </Button>
        }
      />
    )
  }

  return <LoadingState label="Confirmando seu e-mail" />
}

'use client'

import { useMutation } from '@tanstack/react-query'
import NextLink from 'next/link'
import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'

import { Button, Link, Notice } from '@design-system'

import { AccessHeader } from '@/features/acesso/_components/AccessHeader'
import { resendConfirmation } from '@/services/account'

import { formatCountdown, RESEND_SECONDS } from '../../utils'
import * as S from './styles'

export type PendingConfirmationProps = {
  /** E-mail que recebeu o link, lido de `?email=` da URL. */
  email: string
  /** Vale `true` quando a pessoa chegou do Entrar: aparece a linha "Para entrar, falta confirmar". */
  isFromSignIn: boolean
}

/**
 * Avisa que o link de confirmação foi enviado e deixa pedir outro depois de uma espera.
 *
 * @remarks
 * A contagem usa `setInterval` com limpeza, sem depender do relógio do mock. Ao reenviar, a espera
 * recomeça. "Excluir conta" fica de fora: sem sessão, `deleteAccount` não funciona.
 *
 * @example
 * ```tsx
 * <PendingConfirmation email="ana@aluno.ifce.edu.br" isFromSignIn={false} />
 * ```
 */
export function PendingConfirmation({ email, isFromSignIn }: PendingConfirmationProps): ReactNode {
  const [remaining, setRemaining] = useState(RESEND_SECONDS)
  const isCounting = remaining > 0

  useEffect(() => {
    if (!isCounting) return
    const id = setInterval(() => setRemaining((current) => Math.max(0, current - 1)), 1000)

    return () => clearInterval(id)
  }, [isCounting])

  const mutation = useMutation({
    mutationFn: () => resendConfirmation(email),
    onSuccess: () => setRemaining(RESEND_SECONDS),
  })

  return (
    <S.Page>
      <AccessHeader size="sm" />

      {isFromSignIn ? (
        <Notice tone="warning">Para entrar, falta confirmar o seu e-mail.</Notice>
      ) : null}

      <S.Heading>
        <S.Title>Confirme seu e-mail</S.Title>
        <S.Lead>Enviamos um link para</S.Lead>
        <S.Email>{email}</S.Email>
        <S.Lead>
          Abra a caixa do e-mail institucional e toque no link. Se não achar, olhe no spam e na
          lixeira.
        </S.Lead>
      </S.Heading>

      <S.Actions>
        <Button
          variant="secondary"
          block
          disabled={isCounting}
          busy={mutation.isPending}
          busyLabel="Reenviando"
          onClick={() => mutation.mutate()}
        >
          {isCounting ? `Reenviar link em ${formatCountdown(remaining)}` : 'Reenviar link'}
        </Button>
        {mutation.isSuccess && isCounting ? (
          <Notice tone="success">Link reenviado. Olhe também no spam.</Notice>
        ) : null}
        {mutation.isError ? (
          <Notice tone="danger">
            Não conseguimos reenviar agora. Confira sua internet e tente de novo.
          </Notice>
        ) : null}
        <Button as={NextLink} href="/criar-conta" variant="tertiary" block>
          Digitei o e-mail errado
        </Button>
      </S.Actions>

      <Notice format="block" title="Não consegue abrir o e-mail institucional?">
        Peça o acesso ao setor responsável pelo e-mail no seu campus. Reenviar o link não resolve
        esse caso.
      </Notice>

      <S.Footer>
        <Link as={NextLink} href="/entrar" isStandalone>
          Sair
        </Link>
      </S.Footer>
    </S.Page>
  )
}

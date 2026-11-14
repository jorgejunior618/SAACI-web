'use client'

import { useSuspenseQuery } from '@tanstack/react-query'
import type { ReactNode } from 'react'

import { AppFrame } from '@design-system'

import { accountQueries } from '@/services/account'

import { NewPasswordForm } from './_components/NewPasswordForm'
import { Empty } from './Empty'

export type NovaSenhaProps = {
  /** Token do link de nova senha (`?token=`). Sem ele, a tela mostra o link vencido. */
  token?: string
}

function CheckedLink({ token }: { token: string }): ReactNode {
  const { data: link } = useSuspenseQuery(accountQueries.passwordLink(token))

  return link ? <NewPasswordForm token={token} email={link.email} /> : <Empty />
}

/**
 * Tela Nova senha: confere o link ao abrir e deixa escolher a senha nova.
 *
 * @remarks
 * A conferência não gasta o link (`getPasswordLink`), então abrir a página duas vezes não o vence.
 * Quem gasta é o envio do formulário. Sem token, ou com link que não vale, mostra o `ExpiredLink`.
 * A busca suspende: a página envolve a tela em `Suspense` com o `Loading` da feature.
 *
 * @example
 * ```tsx
 * <NovaSenha token={token} />
 * ```
 */
export function NovaSenha({ token }: NovaSenhaProps): ReactNode {
  return <AppFrame>{token ? <CheckedLink token={token} /> : <Empty />}</AppFrame>
}

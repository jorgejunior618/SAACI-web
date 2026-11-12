import * as v from 'valibot'

import { simulateLatency } from '@/utils/simulate-latency'

import { readPasswordLink, readSession } from './account.mock'
import { PasswordLinkSchema, SessionSchema } from './account.types'
import type { PasswordLink, Session } from './account.types'

/**
 * Lê a sessão atual.
 *
 * @returns A sessão, ou `null` quando ninguém está logado.
 */
export async function getSession(): Promise<Session | null> {
  await simulateLatency()
  const session = readSession()

  return session ? v.parse(SessionSchema, session) : null
}

/**
 * Lê o link de nova senha sem gastá-lo, para a tela mostrar "Para <e-mail>" ou o aviso de link
 * vencido assim que abre.
 *
 * @param token Token do link recebido por e-mail.
 * @returns O e-mail do link, ou `null` quando o link não vale (vencido, usado, desconhecido ou de
 * outro tipo).
 */
export async function getPasswordLink(token: string): Promise<PasswordLink | null> {
  await simulateLatency()
  const link = readPasswordLink(token)

  return link ? v.parse(PasswordLinkSchema, link) : null
}

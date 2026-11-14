import { createClient } from '@supabase/client'
import type { DbClient } from '@supabase/client'
import { isAuthSessionMissingError } from '@supabase/supabase-js'
import type { User } from '@supabase/supabase-js'
import * as v from 'valibot'

import { ExpiredLinkError, toAccountError } from './account.errors'
import { PasswordLinkSchema, SessionSchema } from './account.types'
import type { PasswordLink, Session } from './account.types'

// Códigos de um cookie de sessão que não vale mais (apagado no servidor ou vencido). Para o
// aluno, é o mesmo que não ter entrado.
const STALE_SESSION_CODES = ['bad_jwt', 'session_not_found', 'user_not_found']

/**
 * Monta a sessão do domínio a partir do usuário do Supabase Auth.
 *
 * @param user Usuário devolvido pelo Auth.
 * @returns A sessão, já conferida pelo schema.
 */
export function toSession(user: User): Session {
  return v.parse(SessionSchema, {
    email: user.email,
    emailConfirmed: user.email_confirmed_at != null,
  })
}

/**
 * Lê o usuário da sessão aberta no servidor do Auth.
 *
 * @remarks
 * Pergunta ao servidor em vez de confiar só no cookie, porque uma conta apagada ou uma sessão
 * encerrada em outro aparelho ainda tem cookie no navegador.
 *
 * @param db Cliente do Supabase. No servidor, passe o de `@supabase/server`.
 * @returns O usuário, ou `null` quando ninguém está logado.
 */
export async function readCurrentUser(db: DbClient = createClient()): Promise<User | null> {
  const { data, error } = await db.auth.getUser()

  if (!error) return data.user
  if (isAuthSessionMissingError(error) || STALE_SESSION_CODES.includes(String(error.code))) {
    return null
  }
  throw error
}

/**
 * Lê a sessão atual.
 *
 * @param db Cliente do Supabase. No servidor, passe o de `@supabase/server`.
 * @returns A sessão, ou `null` quando ninguém está logado.
 */
export async function getSession(db: DbClient = createClient()): Promise<Session | null> {
  const user = await readCurrentUser(db)

  return user ? toSession(user) : null
}

/**
 * Confere o link de nova senha e devolve o e-mail dele.
 *
 * @remarks
 * O Supabase só valida o token de nova senha gastando-o: a conferência abre uma sessão curta, que
 * depois `updatePassword` usa para gravar a senha. Por isso a segunda chamada com o mesmo token
 * falha no servidor, e o service recorre à sessão que a primeira abriu. A tela chama de novo ao
 * recarregar ou no modo estrito do React, e nenhuma das duas pode mostrar "link vencido".
 *
 * @param token Token do link recebido por e-mail.
 * @param db Cliente do Supabase. No servidor, passe o de `@supabase/server`.
 * @returns O e-mail do link, ou `null` quando o link não vale (vencido, usado ou desconhecido).
 */
export async function getPasswordLink(
  token: string,
  db: DbClient = createClient(),
): Promise<PasswordLink | null> {
  const { data, error } = await db.auth.verifyOtp({ token_hash: token, type: 'recovery' })

  if (!error) return v.parse(PasswordLinkSchema, { email: data.user?.email })

  const user = await readCurrentUser(db)

  if (user) return v.parse(PasswordLinkSchema, { email: user.email })
  if (toAccountError(error) instanceof ExpiredLinkError) return null
  throw error
}

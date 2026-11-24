// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import { createClient } from '@supabase/client'
import type { QueryClient } from '@tanstack/react-query'

import { readCurrentUser, toSession } from './account.api'
import {
  EmailAlreadyRegisteredError,
  ExpiredLinkError,
  InvalidCredentialsError,
  toAccountError,
} from './account.errors'
import { accountKeys } from './account.keys'
import type { Session } from './account.types'

// As mutations criam o cliente por dentro, sem o parâmetro `db` das leituras: só rodam no navegador,
// e o `mutationFn` do TanStack Query passa um contexto como 2º argumento (`mutationFn: confirmEmail`
// o jogaria em `db`). Não "corrija" para o padrão de `doc/camada-servicos.md`.
function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

/**
 * Entra com e-mail e senha.
 *
 * @param email E-mail de aluno. Espaços e maiúsculas são ignorados.
 * @param password Senha da conta.
 * @returns A nova sessão. A tela a grava no cache com `setQueryData(accountKeys.session(), session)`.
 * @throws {InvalidCredentialsError} E-mail desconhecido ou senha errada, sem dizer qual.
 * @throws {EmailNotConfirmedError} A conta existe, mas o e-mail não foi confirmado.
 */
export async function signIn(email: string, password: string): Promise<Session> {
  const db = createClient()
  const { data, error } = await db.auth.signInWithPassword({
    email: normalizeEmail(email),
    password,
  })

  if (error) throw toAccountError(error)
  return toSession(data.user)
}

/** Sai da conta. Depois, chame `clearSessionCache` para nenhum dado do aluno ficar na memória. */
export async function signOut(): Promise<void> {
  const db = createClient()
  const { error } = await db.auth.signOut()

  if (error) throw error
}

/**
 * Cria a conta e envia o link de confirmação. Não abre sessão.
 *
 * @remarks
 * Com a confirmação de e-mail ligada, o Supabase responde sucesso para e-mail que já tem conta
 * confirmada, mas devolve o usuário sem `identities`. É assim que se reconhece o e-mail repetido.
 *
 * @param email E-mail de aluno, o que termina em `@aluno.ifce.edu.br`.
 * @param password Senha nova. A regra de força vive no schema do formulário.
 * @throws {EmailDomainError} O e-mail não é de aluno. A recusa vem do hook do servidor (RF02).
 * @throws {EmailAlreadyRegisteredError} Já existe conta com este e-mail.
 */
export async function createAccount(email: string, password: string): Promise<void> {
  const db = createClient()
  const { data, error } = await db.auth.signUp({ email: normalizeEmail(email), password })

  if (error) throw toAccountError(error)
  if (data.user?.identities?.length === 0) throw new EmailAlreadyRegisteredError()
}

/**
 * Reenvia o link de confirmação. Não avisa se o e-mail não tem conta.
 *
 * @param email E-mail que recebeu o primeiro link.
 */
export async function resendConfirmation(email: string): Promise<void> {
  const db = createClient()
  const { error } = await db.auth.resend({ type: 'signup', email: normalizeEmail(email) })

  if (error) throw toAccountError(error)
}

/**
 * Confirma o e-mail pelo link e abre a sessão.
 *
 * @remarks
 * O link do e-mail abre `/confirme-email?token=<token_hash>`, e a tela troca esse token pela sessão.
 * O token vale uma vez. A confirmação não passa por rota de callback no servidor: o cliente do
 * navegador grava o cookie da sessão.
 *
 * @param token Token do link recebido por e-mail.
 * @throws {ExpiredLinkError} O link venceu, já foi usado ou foi trocado por um mais novo.
 */
export async function confirmEmail(token: string): Promise<Session> {
  const db = createClient()
  const { data, error } = await db.auth.verifyOtp({ token_hash: token, type: 'email' })

  if (error) throw toAccountError(error)
  if (!data.user) throw new ExpiredLinkError()
  return toSession(data.user)
}

/**
 * Envia o link para criar uma senha nova. Responde igual para e-mail com e sem conta.
 *
 * @param email E-mail da conta.
 */
export async function requestPasswordReset(email: string): Promise<void> {
  const db = createClient()
  const { error } = await db.auth.resetPasswordForEmail(normalizeEmail(email))

  if (error) throw toAccountError(error)
}

/**
 * Grava a senha nova na sessão que `getPasswordLink` abriu com o link e devolve a sessão.
 *
 * @remarks
 * O token do link já foi gasto na conferência da tela (`getPasswordLink`), então esta função não o
 * recebe: quem prova o acesso é a sessão de nova senha. Sem ela, o link venceu.
 *
 * @param password Senha nova.
 * @throws {ExpiredLinkError} O link venceu, já foi usado ou foi trocado por um mais novo.
 */
export async function updatePassword(password: string): Promise<Session> {
  const db = createClient()

  if (!(await readCurrentUser(db))) throw new ExpiredLinkError()

  const { data, error } = await db.auth.updateUser({ password })

  if (error) throw toAccountError(error)
  return toSession(data.user)
}

/**
 * Marca como vencida a leitura do link de nova senha, depois que `updatePassword` o gastou.
 *
 * @remarks
 * Só marca, sem buscar de novo: a tela que mostrava o formulário está saindo. Se a pessoa voltar a
 * ela, a leitura é refeita e o link aparece como vencido.
 *
 * @param queryClient Cliente de cache da aplicação.
 * @param token Token do link que foi usado.
 */
export function invalidateAfterPasswordUpdate(queryClient: QueryClient, token: string): void {
  void queryClient.invalidateQueries({
    queryKey: accountKeys.passwordLink(token),
    refetchType: 'none',
  })
}

/**
 * Apaga a conta, as atividades e os comprovantes de quem está logado.
 *
 * @remarks
 * Confere a senha entrando de novo, depois chama a função `apagar_minha_conta` do banco e encerra
 * só a sessão local, porque a sessão no servidor já foi apagada junto com o usuário. O perfil e as
 * atividades saem em cascata. Os arquivos do Storage saem pela rotina agendada `limpa-comprovantes`
 * (ADR 0011), dentro do prazo de 7 dias do RNF05 (ADR 0017).
 *
 * @param password Senha da conta, pedida de novo para confirmar.
 * @throws {InvalidCredentialsError} Não há sessão ou a senha não confere.
 */
export async function deleteAccount(password: string): Promise<void> {
  const db = createClient()
  const user = await readCurrentUser(db)

  if (!user?.email) throw new InvalidCredentialsError()

  const check = await db.auth.signInWithPassword({ email: user.email, password })

  if (check.error) throw toAccountError(check.error)

  const { error } = await db.rpc('apagar_minha_conta')

  if (error) throw error

  await db.auth.signOut({ scope: 'local' })
}

/**
 * Esvazia todo o cache. Chame ao sair ou ao apagar a conta.
 *
 * @remarks
 * Sem isso, o dado de uma conta ainda estaria na memória quando outra entrasse no mesmo navegador
 * (RNF04).
 */
export function clearSessionCache(queryClient: QueryClient): void {
  queryClient.clear()
}

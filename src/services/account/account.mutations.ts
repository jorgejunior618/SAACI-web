import type { QueryClient } from '@tanstack/react-query'
import * as v from 'valibot'

import { simulateLatency } from '@/utils/simulate-latency'

import { accountKeys } from './account.keys'
import {
  changePasswordByToken,
  closeSession,
  confirmByToken,
  insertAccount,
  issuePasswordLink,
  openSession,
  reissueConfirmation,
  removeSessionAccount,
} from './account.mock'
import { SessionSchema } from './account.types'
import type { Session } from './account.types'

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
  await simulateLatency()

  return v.parse(SessionSchema, openSession(normalizeEmail(email), password))
}

/** Sai da conta. Depois, chame `clearSessionCache` para nenhum dado do aluno ficar na memória. */
export async function signOut(): Promise<void> {
  await simulateLatency()
  closeSession()
}

/**
 * Cria a conta e envia o link de confirmação. Não abre sessão.
 *
 * @param email E-mail de aluno, o que termina em `@aluno.ifce.edu.br`.
 * @param password Senha nova. A regra de força vive no schema do formulário.
 * @throws {EmailDomainError} O e-mail não é de aluno.
 * @throws {EmailAlreadyRegisteredError} Já existe conta com este e-mail.
 */
export async function createAccount(email: string, password: string): Promise<void> {
  await simulateLatency()
  insertAccount(normalizeEmail(email), password)
}

/** Reenvia o link de confirmação. Não avisa se o e-mail não tem conta. */
export async function resendConfirmation(email: string): Promise<void> {
  await simulateLatency()
  reissueConfirmation(normalizeEmail(email))
}

/**
 * Confirma o e-mail pelo link e abre a sessão.
 *
 * @remarks
 * Alvo: no Supabase o link cai numa rota de callback e o navegador já chega logado. Esta função
 * representa essa chegada para a tela `/confirme-email?token=`.
 *
 * @param token Token do link recebido por e-mail.
 * @throws {ExpiredLinkError} O link venceu, já foi usado ou foi trocado por um mais novo.
 */
export async function confirmEmail(token: string): Promise<Session> {
  await simulateLatency()

  return v.parse(SessionSchema, confirmByToken(token))
}

/** Envia o link para criar uma senha nova. Responde igual para e-mail com e sem conta. */
export async function requestPasswordReset(email: string): Promise<void> {
  await simulateLatency()
  issuePasswordLink(normalizeEmail(email))
}

/**
 * Grava a senha nova pelo link e abre a sessão.
 *
 * @param token Token do link recebido por e-mail.
 * @param password Senha nova.
 * @throws {ExpiredLinkError} O link venceu, já foi usado ou foi trocado por um mais novo.
 */
export async function updatePassword(token: string, password: string): Promise<Session> {
  await simulateLatency()

  return v.parse(SessionSchema, changePasswordByToken(token, password))
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
 * @param password Senha da conta, pedida de novo para confirmar.
 * @throws {InvalidCredentialsError} A senha não confere.
 */
export async function deleteAccount(password: string): Promise<void> {
  await simulateLatency()
  removeSessionAccount(password)
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

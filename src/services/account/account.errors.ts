// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import { isAuthApiError } from '@supabase/supabase-js'

/**
 * E-mail desconhecido ou senha errada. A mensagem é a mesma para os dois de propósito: dizer qual
 * errou ajudaria quem tenta descobrir e-mails de aluno.
 */
export class InvalidCredentialsError extends Error {
  constructor() {
    super('A senha não confere com este e-mail.')
    this.name = 'SenhaNaoConfereError'
  }
}

/** Já existe conta com este e-mail. A tela leva a Entrar ou a recuperar a senha. */
export class EmailAlreadyRegisteredError extends Error {
  constructor() {
    super('Este e-mail já tem uma conta.')
    this.name = 'EmailJaCadastradoError'
  }
}

/** A conta existe, mas o aluno ainda não tocou no link do e-mail. A tela leva a Confirme seu e-mail. */
export class EmailNotConfirmedError extends Error {
  constructor() {
    super('Falta confirmar o e-mail.')
    this.name = 'EmailNaoConfirmadoError'
  }
}

/** O link de confirmação ou de nova senha venceu ou já foi trocado por um mais novo. */
export class ExpiredLinkError extends Error {
  constructor() {
    super('Este link não vale mais.')
    this.name = 'LinkExpiradoError'
  }
}

/** O e-mail não termina em `@aluno.ifce.edu.br`. A mesma regra vale no servidor (RF02). */
export class EmailDomainError extends Error {
  constructor() {
    super('Use o e-mail de aluno, o que termina em @aluno.ifce.edu.br.')
    this.name = 'EmailForaDoDominioError'
  }
}

const STUDENT_DOMAIN = '@aluno.ifce.edu.br'

/**
 * Traduz o erro do Supabase Auth para o erro de domínio da conta, quando conhece a causa.
 *
 * @remarks
 * Só traduz o que conhece. Erro de rede, limite de envio ou qualquer outro volta intacto, para uma
 * falha de conexão nunca virar "a senha não confere" na tela. O 403 do hook de cadastro e o erro
 * `P0001` do gatilho de troca de e-mail (RF40) trazem a mesma mensagem, e é por ela que o domínio é
 * reconhecido.
 *
 * @param error Erro devolvido pelo `supabase-js`.
 * @returns O erro de domínio correspondente, ou o próprio `error` quando não há tradução.
 *
 * @example
 * if (error) throw toAccountError(error)
 */
export function toAccountError(error: Error): Error {
  const code = isAuthApiError(error) ? error.code : undefined

  if (code === 'invalid_credentials') return new InvalidCredentialsError()
  if (code === 'email_not_confirmed') return new EmailNotConfirmedError()
  if (code === 'otp_expired') return new ExpiredLinkError()
  if (code === 'user_already_exists' || code === 'email_exists') {
    return new EmailAlreadyRegisteredError()
  }
  if (error.message.includes(STUDENT_DOMAIN)) return new EmailDomainError()

  return error
}

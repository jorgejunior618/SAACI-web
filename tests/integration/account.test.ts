import { createClient } from '@supabase/client'
import { beforeEach, describe, expect, it } from 'vitest'

import {
  confirmEmail,
  createAccount,
  deleteAccount,
  EmailAlreadyRegisteredError,
  EmailDomainError,
  EmailNotConfirmedError,
  ExpiredLinkError,
  getPasswordLink,
  getSession,
  InvalidCredentialsError,
  requestPasswordReset,
  resendConfirmation,
  signIn,
  signOut,
  updatePassword,
} from '@/services/account'

import { countEmails, waitForEmailLink } from './helpers/mailpit'

// Fluxo de conta contra o Supabase local. Cada teste usa um e-mail novo: o banco não é limpo
// entre execuções, e a conta sem confirmar some pela rotina do RNF27.
const PASSWORD = 'senhaforte1'
let counter = 0

// `max_frequency = "1s"` em supabase/config.toml: dentro desse intervalo, outro cadastro ou reenvio
// para o mesmo e-mail volta 429. A folga cobre a diferença de relógio entre o teste e o Auth.
const EMAIL_INTERVAL_MS = 1_300

function waitEmailInterval(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, EMAIL_INTERVAL_MS))
}

function newEmail(label: string): string {
  counter += 1
  return `it.${label}.${Date.now()}.${counter}@aluno.ifce.edu.br`
}

/** Cria a conta, confirma pelo link do e-mail e sai, deixando a conta pronta para entrar. */
async function createConfirmedAccount(email: string): Promise<void> {
  await createAccount(email, PASSWORD)
  await confirmEmail((await waitForEmailLink(email)).token)
  await signOut()
}

beforeEach(async () => {
  await signOut()
})

describe('criar conta', () => {
  it('recusa e-mail fora do domínio no servidor (hook de cadastro, RF02)', async () => {
    await expect(createAccount(`fora.${Date.now()}@gmail.com`, PASSWORD)).rejects.toBeInstanceOf(
      EmailDomainError,
    )
  })

  it('cria sem abrir sessão e barra o login até confirmar', async () => {
    const email = newEmail('cria')

    await createAccount(email, PASSWORD)

    expect(await getSession()).toBeNull()
    await expect(signIn(email, PASSWORD)).rejects.toBeInstanceOf(EmailNotConfirmedError)
  })

  it('reenvia o link de confirmação', async () => {
    const email = newEmail('reenvio')

    await createAccount(email, PASSWORD)
    await waitForEmailLink(email, 1)
    await waitEmailInterval()
    await resendConfirmation(email)

    const second = await waitForEmailLink(email, 2)

    expect(second.count).toBe(2)
  })

  it('recusa e-mail que já tem conta confirmada', async () => {
    const email = newEmail('repetido')

    await createConfirmedAccount(email)

    await expect(createAccount(email, PASSWORD)).rejects.toBeInstanceOf(EmailAlreadyRegisteredError)
  })

  it('não acusa repetido quando a conta ainda não foi confirmada', async () => {
    const email = newEmail('pendente')

    await createAccount(email, PASSWORD)
    await waitEmailInterval()

    // Comportamento do Supabase: reenvia a confirmação e responde sucesso.
    await expect(createAccount(email, PASSWORD)).resolves.toBeUndefined()
    expect(await countEmails(email)).toBeGreaterThanOrEqual(1)
  })
})

describe('confirmar e-mail', () => {
  it('abre a sessão com o link e recusa o mesmo link uma segunda vez', async () => {
    const email = newEmail('confirma')

    await createAccount(email, PASSWORD)

    const { token } = await waitForEmailLink(email)

    await expect(confirmEmail(token)).resolves.toEqual({ email, emailConfirmed: true })
    expect(await getSession()).toEqual({ email, emailConfirmed: true })

    await signOut()
    await expect(confirmEmail(token)).rejects.toBeInstanceOf(ExpiredLinkError)
  })

  it('trata um token inventado como link vencido', async () => {
    await expect(confirmEmail('token-que-nao-existe')).rejects.toBeInstanceOf(ExpiredLinkError)
  })
})

describe('entrar e sair', () => {
  it('recusa senha errada e e-mail desconhecido com o mesmo erro e a mesma mensagem', async () => {
    const email = newEmail('login-erro')

    await createConfirmedAccount(email)

    const wrongPassword = await signIn(email, 'errada123').catch((error: unknown) => error)
    const unknownEmail = await signIn(newEmail('fantasma'), PASSWORD).catch(
      (error: unknown) => error,
    )

    expect(wrongPassword).toBeInstanceOf(InvalidCredentialsError)
    expect(unknownEmail).toBeInstanceOf(InvalidCredentialsError)
    expect((wrongPassword as Error).message).toBe((unknownEmail as Error).message)
  })

  it('entra, mostra a sessão e sai', async () => {
    const email = newEmail('login')

    await createConfirmedAccount(email)

    await expect(signIn(` ${email.toUpperCase()} `, PASSWORD)).resolves.toEqual({
      email,
      emailConfirmed: true,
    })
    expect(await getSession()).toEqual({ email, emailConfirmed: true })

    await signOut()

    expect(await getSession()).toBeNull()
  })
})

describe('recuperar senha', () => {
  it('responde igual para e-mail com e sem conta, e só o dono recebe o link', async () => {
    const known = newEmail('recupera-conhecido')
    const unknown = newEmail('recupera-fantasma')

    await createConfirmedAccount(known)

    await expect(requestPasswordReset(known)).resolves.toBeUndefined()
    await expect(requestPasswordReset(unknown)).resolves.toBeUndefined()

    // O de confirmação foi o 1º e-mail; o de nova senha é o 2º.
    expect((await waitForEmailLink(known, 2)).count).toBe(2)
    expect(await countEmails(unknown)).toBe(0)
  })

  it('confere o link, grava a senha nova, abre a sessão e invalida a senha antiga', async () => {
    const email = newEmail('recupera')

    await createConfirmedAccount(email)
    await requestPasswordReset(email)

    const { token } = await waitForEmailLink(email, 2)

    await expect(getPasswordLink(token)).resolves.toEqual({ email })
    // A tela confere de novo ao recarregar ou no modo estrito do React: o link já foi gasto.
    await expect(getPasswordLink(token)).resolves.toEqual({ email })

    await expect(updatePassword(token, 'outrasenha9')).resolves.toEqual({
      email,
      emailConfirmed: true,
    })
    await signOut()

    await expect(signIn(email, PASSWORD)).rejects.toBeInstanceOf(InvalidCredentialsError)
    await expect(signIn(email, 'outrasenha9')).resolves.toMatchObject({ email })
  })

  it('trata link inventado como vencido e recusa gravar senha sem o link', async () => {
    await expect(getPasswordLink('token-que-nao-existe')).resolves.toBeNull()
    await expect(updatePassword('token-que-nao-existe', 'outrasenha9')).rejects.toBeInstanceOf(
      ExpiredLinkError,
    )
  })
})

describe('trocar o e-mail para fora do IFCE (RF40)', () => {
  it('é barrado pelo gatilho do banco: o e-mail não muda e não fica troca pendente', async () => {
    const email = newEmail('troca')

    await createConfirmedAccount(email)
    await signIn(email, PASSWORD)

    const db = createClient()
    const { error } = await db.auth.updateUser({ email: `troca.${Date.now()}@gmail.com` })

    // O gatilho levanta P0001 com a mensagem em português, mas o Auth a esconde: o navegador só vê
    // um 500 genérico. Por isso a tradução para `EmailDomainError` não pode partir deste erro.
    expect(error).toMatchObject({ status: 500, message: 'Error sending email change email' })

    const { data } = await db.auth.getUser()

    expect(data.user?.email).toBe(email)
    expect(data.user?.new_email).toBeUndefined()
  })
})

describe('apagar conta', () => {
  it('recusa a senha errada e mantém a conta', async () => {
    const email = newEmail('apaga-erro')

    await createConfirmedAccount(email)
    await signIn(email, PASSWORD)

    await expect(deleteAccount('errada123')).rejects.toBeInstanceOf(InvalidCredentialsError)
    expect(await getSession()).toEqual({ email, emailConfirmed: true })
  })

  it('apaga com a senha certa, fecha a sessão e libera o e-mail', async () => {
    const email = newEmail('apaga')

    await createConfirmedAccount(email)
    await signIn(email, PASSWORD)

    await deleteAccount(PASSWORD)

    expect(await getSession()).toBeNull()
    await expect(signIn(email, PASSWORD)).rejects.toBeInstanceOf(InvalidCredentialsError)
  })

  it('recusa quando não há sessão', async () => {
    await expect(deleteAccount(PASSWORD)).rejects.toBeInstanceOf(InvalidCredentialsError)
  })
})

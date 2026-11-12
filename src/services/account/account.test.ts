import { AuthApiError, AuthSessionMissingError } from '@supabase/supabase-js'
import type { User } from '@supabase/supabase-js'
import * as v from 'valibot'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getPasswordLink, getSession } from './account.api'
import {
  EmailAlreadyRegisteredError,
  EmailDomainError,
  EmailNotConfirmedError,
  ExpiredLinkError,
  InvalidCredentialsError,
} from './account.errors'
import {
  confirmEmail,
  createAccount,
  deleteAccount,
  requestPasswordReset,
  resendConfirmation,
  signIn,
  signOut,
  updatePassword,
} from './account.mutations'
import { StudentEmailSchema } from './account.types'

const EMAIL = 'ana.moura07@aluno.ifce.edu.br'

const auth = {
  getUser: vi.fn(),
  resend: vi.fn(),
  resetPasswordForEmail: vi.fn(),
  signInWithPassword: vi.fn(),
  signOut: vi.fn(),
  signUp: vi.fn(),
  updateUser: vi.fn(),
  verifyOtp: vi.fn(),
}
const rpc = vi.fn()

// Só o navegador cria cliente; o mock devolve sempre o mesmo, com as funções de `auth` falsas.
vi.mock('@supabase/client', () => ({ createClient: () => ({ auth, rpc }) }))

function user(overrides: Partial<User> = {}): User {
  return {
    id: 'u1',
    email: EMAIL,
    email_confirmed_at: '2026-11-12T10:00:00Z',
    ...overrides,
  } as User
}

function apiError(code: string, status = 400, message = 'erro'): AuthApiError {
  return new AuthApiError(message, status, code)
}

const ok = (u: User | null = user()) => ({ data: { user: u, session: null }, error: null })
const fail = (error: Error) => ({ data: { user: null, session: null }, error })

beforeEach(() => {
  vi.resetAllMocks()
})

describe('sessão', () => {
  it('devolve a sessão de quem está logado', async () => {
    auth.getUser.mockResolvedValue(ok())

    expect(await getSession()).toEqual({ email: EMAIL, emailConfirmed: true })
  })

  it('marca o e-mail como não confirmado quando a data não existe', async () => {
    auth.getUser.mockResolvedValue(ok(user({ email_confirmed_at: undefined })))

    expect(await getSession()).toEqual({ email: EMAIL, emailConfirmed: false })
  })

  it('devolve null sem sessão e com cookie que não vale mais', async () => {
    auth.getUser.mockResolvedValueOnce(fail(new AuthSessionMissingError()))
    auth.getUser.mockResolvedValueOnce(fail(apiError('session_not_found', 403)))

    expect(await getSession()).toBeNull()
    expect(await getSession()).toBeNull()
  })

  it('repassa o erro desconhecido em vez de fingir que ninguém entrou', async () => {
    const boom = new Error('rede caiu')

    auth.getUser.mockResolvedValue(fail(boom))

    await expect(getSession()).rejects.toBe(boom)
  })
})

describe('entrar', () => {
  it('ignora espaço e maiúscula no e-mail e devolve a sessão', async () => {
    auth.signInWithPassword.mockResolvedValue(ok())

    await expect(signIn(`  ${EMAIL.toUpperCase()} `, 'senhaforte1')).resolves.toEqual({
      email: EMAIL,
      emailConfirmed: true,
    })
    expect(auth.signInWithPassword).toHaveBeenCalledWith({ email: EMAIL, password: 'senhaforte1' })
  })

  it('traduz credencial inválida e e-mail não confirmado', async () => {
    auth.signInWithPassword.mockResolvedValueOnce(fail(apiError('invalid_credentials')))
    auth.signInWithPassword.mockResolvedValueOnce(fail(apiError('email_not_confirmed')))

    await expect(signIn(EMAIL, 'errada123')).rejects.toBeInstanceOf(InvalidCredentialsError)
    await expect(signIn(EMAIL, 'senhaforte1')).rejects.toBeInstanceOf(EmailNotConfirmedError)
  })

  it('repassa o erro desconhecido, sem virar senha errada', async () => {
    const limit = apiError('over_request_rate_limit', 429)

    auth.signInWithPassword.mockResolvedValue(fail(limit))

    await expect(signIn(EMAIL, 'senhaforte1')).rejects.toBe(limit)
  })

  it('sai da conta', async () => {
    auth.signOut.mockResolvedValue({ error: null })

    await expect(signOut()).resolves.toBeUndefined()
  })
})

describe('criar conta', () => {
  it('cria sem abrir sessão', async () => {
    auth.signUp.mockResolvedValue({
      data: { user: user({ identities: [{ id: 'i1' }] as User['identities'] }), session: null },
      error: null,
    })

    await expect(createAccount(` ${EMAIL.toUpperCase()}`, 'minhasenha9')).resolves.toBeUndefined()
    expect(auth.signUp).toHaveBeenCalledWith({ email: EMAIL, password: 'minhasenha9' })
  })

  it('traduz o 403 do hook de cadastro para e-mail fora do domínio', async () => {
    auth.signUp.mockResolvedValue(
      fail(apiError('unexpected_failure', 403, 'Use seu e-mail @aluno.ifce.edu.br.')),
    )

    await expect(createAccount('x@gmail.com', 'minhasenha9')).rejects.toBeInstanceOf(
      EmailDomainError,
    )
  })

  it('traduz o erro do gatilho de troca de e-mail (P0001) com a mesma mensagem', async () => {
    auth.signUp.mockResolvedValue(
      fail(apiError('unexpected_failure', 500, 'Use seu e-mail @aluno.ifce.edu.br.')),
    )

    await expect(createAccount('x@gmail.com', 'minhasenha9')).rejects.toBeInstanceOf(
      EmailDomainError,
    )
  })

  it('reconhece e-mail repetido pelas identities vazias e pelo código', async () => {
    auth.signUp.mockResolvedValueOnce({
      data: { user: user({ identities: [] }), session: null },
      error: null,
    })
    auth.signUp.mockResolvedValueOnce(fail(apiError('user_already_exists', 422)))

    await expect(createAccount(EMAIL, 'minhasenha9')).rejects.toBeInstanceOf(
      EmailAlreadyRegisteredError,
    )
    await expect(createAccount(EMAIL, 'minhasenha9')).rejects.toBeInstanceOf(
      EmailAlreadyRegisteredError,
    )
  })

  it('reenvia a confirmação e repassa o limite de envio', async () => {
    const limit = apiError('over_email_send_rate_limit', 429)

    auth.resend.mockResolvedValueOnce({ data: {}, error: null })
    auth.resend.mockResolvedValueOnce({ data: {}, error: limit })

    await expect(resendConfirmation(EMAIL)).resolves.toBeUndefined()
    expect(auth.resend).toHaveBeenCalledWith({ type: 'signup', email: EMAIL })
    await expect(resendConfirmation(EMAIL)).rejects.toBe(limit)
  })
})

describe('confirmar e-mail', () => {
  it('troca o token pela sessão', async () => {
    auth.verifyOtp.mockResolvedValue(ok())

    await expect(confirmEmail('abc')).resolves.toEqual({ email: EMAIL, emailConfirmed: true })
    expect(auth.verifyOtp).toHaveBeenCalledWith({ token_hash: 'abc', type: 'email' })
  })

  it('traduz link vencido', async () => {
    auth.verifyOtp.mockResolvedValue(fail(apiError('otp_expired', 403)))

    await expect(confirmEmail('abc')).rejects.toBeInstanceOf(ExpiredLinkError)
  })
})

describe('nova senha', () => {
  it('pede o link sem avisar se o e-mail tem conta', async () => {
    auth.resetPasswordForEmail.mockResolvedValue({ data: {}, error: null })

    await expect(requestPasswordReset(` ${EMAIL.toUpperCase()}`)).resolves.toBeUndefined()
    expect(auth.resetPasswordForEmail).toHaveBeenCalledWith(EMAIL)
  })

  it('confere o link e devolve o e-mail dele', async () => {
    auth.verifyOtp.mockResolvedValue(ok())

    expect(await getPasswordLink('abc')).toEqual({ email: EMAIL })
    expect(auth.verifyOtp).toHaveBeenCalledWith({ token_hash: 'abc', type: 'recovery' })
  })

  it('na segunda conferência, o token já gasto cai na sessão que a primeira abriu', async () => {
    auth.verifyOtp.mockResolvedValue(fail(apiError('otp_expired', 403)))
    auth.getUser.mockResolvedValue(ok())

    expect(await getPasswordLink('abc')).toEqual({ email: EMAIL })
  })

  it('devolve null para link vencido sem sessão e repassa o erro desconhecido', async () => {
    const boom = new Error('rede caiu')

    auth.getUser.mockResolvedValue(fail(new AuthSessionMissingError()))
    auth.verifyOtp.mockResolvedValueOnce(fail(apiError('otp_expired', 403)))
    auth.verifyOtp.mockResolvedValueOnce(fail(boom))

    expect(await getPasswordLink('abc')).toBeNull()
    await expect(getPasswordLink('abc')).rejects.toBe(boom)
  })

  it('grava a senha na sessão do link e devolve a sessão', async () => {
    auth.getUser.mockResolvedValue(ok())
    auth.updateUser.mockResolvedValue(ok())

    await expect(updatePassword('abc', 'outrasenha9')).resolves.toEqual({
      email: EMAIL,
      emailConfirmed: true,
    })
    expect(auth.updateUser).toHaveBeenCalledWith({ password: 'outrasenha9' })
  })

  it('trata a falta de sessão de nova senha como link vencido', async () => {
    auth.getUser.mockResolvedValue(fail(new AuthSessionMissingError()))

    await expect(updatePassword('abc', 'outrasenha9')).rejects.toBeInstanceOf(ExpiredLinkError)
    expect(auth.updateUser).not.toHaveBeenCalled()
  })
})

describe('apagar conta', () => {
  it('recusa a senha errada sem apagar nada', async () => {
    auth.getUser.mockResolvedValue(ok())
    auth.signInWithPassword.mockResolvedValue(fail(apiError('invalid_credentials')))

    await expect(deleteAccount('errada123')).rejects.toBeInstanceOf(InvalidCredentialsError)
    expect(rpc).not.toHaveBeenCalled()
  })

  it('recusa quando não há sessão', async () => {
    auth.getUser.mockResolvedValue(fail(new AuthSessionMissingError()))

    await expect(deleteAccount('senhaforte1')).rejects.toBeInstanceOf(InvalidCredentialsError)
    expect(rpc).not.toHaveBeenCalled()
  })

  it('apaga com a senha certa e encerra só a sessão local', async () => {
    auth.getUser.mockResolvedValue(ok())
    auth.signInWithPassword.mockResolvedValue(ok())
    auth.signOut.mockResolvedValue({ error: null })
    rpc.mockResolvedValue({ data: 1, error: null })

    await deleteAccount('senhaforte1')

    expect(rpc).toHaveBeenCalledWith('apagar_minha_conta')
    expect(auth.signOut).toHaveBeenCalledWith({ scope: 'local' })
  })
})

describe('e-mail de aluno', () => {
  it('aceita só e-mail de aluno, ignorando espaço e maiúscula', () => {
    expect(v.parse(StudentEmailSchema, '  ANA@Aluno.IFCE.edu.br ')).toBe('ana@aluno.ifce.edu.br')
    expect(v.safeParse(StudentEmailSchema, 'ana@gmail.com').success).toBe(false)
  })
})

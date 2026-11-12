import * as v from 'valibot'
import { beforeEach, describe, expect, it } from 'vitest'

import { getPasswordLink, getSession } from './account.api'
import {
  EmailAlreadyRegisteredError,
  EmailDomainError,
  EmailNotConfirmedError,
  ExpiredLinkError,
  InvalidCredentialsError,
} from './account.errors'
import { peekLastLinkMock, resetAccountMock } from './account.mock'
import {
  createAccount,
  deleteAccount,
  requestPasswordReset,
  signIn,
  signOut,
  updatePassword,
} from './account.mutations'
import { StudentEmailSchema } from './account.types'

const EMAIL = 'ana.moura07@aluno.ifce.edu.br'

describe('conta', () => {
  beforeEach(resetAccountMock)

  it('começa logada como a aluna do protótipo', async () => {
    expect(await getSession()).toEqual({ email: EMAIL, emailConfirmed: true })
  })

  it('sai e fica sem sessão', async () => {
    await signOut()

    expect(await getSession()).toBeNull()
  })

  it('recusa e-mail desconhecido e senha errada com o mesmo erro', async () => {
    await signOut()

    await expect(signIn(EMAIL, 'errada123')).rejects.toBeInstanceOf(InvalidCredentialsError)
    await expect(signIn('outra@aluno.ifce.edu.br', 'senhaforte1')).rejects.toBeInstanceOf(
      InvalidCredentialsError,
    )
  })

  it('ignora espaço e maiúscula no e-mail ao entrar', async () => {
    await signOut()

    await expect(signIn(`  ${EMAIL.toUpperCase()} `, 'senhaforte1')).resolves.toMatchObject({
      email: EMAIL,
    })
  })

  it('cria a conta sem abrir sessão e barra o login até confirmar', async () => {
    await signOut()
    await createAccount('novo.aluno@aluno.ifce.edu.br', 'minhasenha9')

    expect(await getSession()).toBeNull()
    await expect(signIn('novo.aluno@aluno.ifce.edu.br', 'minhasenha9')).rejects.toBeInstanceOf(
      EmailNotConfirmedError,
    )
  })

  it('recusa e-mail repetido e e-mail fora do domínio', async () => {
    await expect(createAccount(EMAIL, 'minhasenha9')).rejects.toBeInstanceOf(
      EmailAlreadyRegisteredError,
    )
    await expect(createAccount('x@gmail.com', 'minhasenha9')).rejects.toBeInstanceOf(
      EmailDomainError,
    )
  })

  it('trata o token expirado como link vencido', async () => {
    await expect(updatePassword('expirado', 'outrasenha9')).rejects.toBeInstanceOf(ExpiredLinkError)
  })

  it('apaga a conta só com a senha certa', async () => {
    await expect(deleteAccount('errada123')).rejects.toBeInstanceOf(InvalidCredentialsError)

    await deleteAccount('senhaforte1')

    expect(await getSession()).toBeNull()
    await expect(signIn(EMAIL, 'senhaforte1')).rejects.toBeInstanceOf(InvalidCredentialsError)
  })

  it('lê o link de nova senha sem gastá-lo', async () => {
    await requestPasswordReset(EMAIL)
    const token = peekLastLinkMock(EMAIL, 'password') ?? ''

    expect(await getPasswordLink(token)).toEqual({ email: EMAIL })
    expect(await getPasswordLink(token)).toEqual({ email: EMAIL })
  })

  it('devolve null para link vencido, desconhecido ou de confirmação', async () => {
    await createAccount('novo.aluno@aluno.ifce.edu.br', 'minhasenha9')
    const confirmation = peekLastLinkMock('novo.aluno@aluno.ifce.edu.br', 'confirmation') ?? ''

    expect(await getPasswordLink('expirado')).toBeNull()
    expect(await getPasswordLink('qualquer-coisa')).toBeNull()
    expect(await getPasswordLink(confirmation)).toBeNull()
  })

  it('aceita só e-mail de aluno, ignorando espaço e maiúscula', () => {
    expect(v.parse(StudentEmailSchema, '  ANA@Aluno.IFCE.edu.br ')).toBe('ana@aluno.ifce.edu.br')
    expect(v.safeParse(StudentEmailSchema, 'ana@gmail.com').success).toBe(false)
  })
})

import { beforeEach, describe, expect, it } from 'vitest'

import { getSession } from './account.api'
import {
  EmailAlreadyRegisteredError,
  EmailDomainError,
  EmailNotConfirmedError,
  ExpiredLinkError,
  InvalidCredentialsError,
} from './account.errors'
import { resetAccountMock } from './account.mock'
import { createAccount, deleteAccount, signIn, signOut, updatePassword } from './account.mutations'

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
})

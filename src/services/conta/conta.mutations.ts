import { simularLatencia, writeDb } from '../_mock'

import { toSessao } from './conta.api'
import { SenhaNaoConfereError } from './conta.errors'
import type { Sessao } from './conta.types'

const normalizar = (email: string): string => email.trim().toLowerCase()

export async function entrar(email: string, senha: string): Promise<Sessao> {
  await simularLatencia(600)

  const db = writeDb((db) => {
    // Sem saber o motivo exato, a mensagem é a mesma para e-mail ou senha errados.
    if (!db.conta || db.conta.email !== normalizar(email) || db.conta.senha !== senha) {
      throw new SenhaNaoConfereError()
    }
    db.hasSessao = true
  })

  return toSessao(db.conta!)
}

export async function sair(): Promise<void> {
  await simularLatencia(150)
  writeDb((db) => {
    db.hasSessao = false
  })
}

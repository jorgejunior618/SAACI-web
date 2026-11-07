import { type ContaMock, readDb, simularLatencia } from '../_mock'
import type { Sessao } from './conta.types'

export function toSessao(conta: ContaMock): Sessao {
  return { email: conta.email }
}

export async function getSessao(): Promise<Sessao | null> {
  await simularLatencia(150)
  const db = readDb()

  return db.hasSessao && db.conta ? toSessao(db.conta) : null
}

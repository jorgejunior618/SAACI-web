import { type ContaMock, readDb, simularLatencia } from '../_mock'
import { getCursoSync } from '../cursos/cursos.api'

import { SemSessaoError } from './conta.errors'
import type { Sessao } from './conta.types'

export function toSessao(conta: ContaMock): Sessao {
  const curso = conta.cursoId ? getCursoSync(conta.cursoId) : null

  return {
    email: conta.email,
    nome: conta.nome,
    matricula: conta.matricula,
    ingresso: conta.ingresso,
    curso: curso && {
      id: curso.id,
      nome: curso.nome,
      grau: curso.grau,
      campus: curso.campus,
      meta: curso.meta,
    },
    isEmailConfirmado: conta.isEmailConfirmado,
    linkEnviadoEm: conta.linkEnviadoEm,
  }
}

export async function getSessao(): Promise<Sessao | null> {
  await simularLatencia(150)
  const db = readDb()

  return db.hasSessao && db.conta ? toSessao(db.conta) : null
}

// Para outros services que só fazem sentido com sessão aberta.
export function requireConta(): ContaMock {
  const db = readDb()
  if (!db.hasSessao || !db.conta) throw new SemSessaoError()
  return db.conta
}

// Faz o papel de ler o token do link de nova senha: devolve o e-mail da conta, se houver.
export async function getEmailDoLink(): Promise<string | null> {
  await simularLatencia(150)
  return readDb().conta?.email ?? null
}

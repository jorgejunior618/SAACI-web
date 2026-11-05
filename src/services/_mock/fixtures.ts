import type { ContaMock, MockDb } from './db'

// Conta de exemplo, de design-system/docs/telas-e-fluxos.md. Os testes montam estados com ela, e
// o painel "Mock" a cria em desenvolvimento, já que não há tela de cadastro.
export const CONTA_FIXTURE: ContaMock = {
  email: 'ana.moura07@aluno.ifce.edu.br',
  senha: 'saaci2026',
}

export const FIXTURES = {
  'com-sessao': 'Conta de exemplo, com sessão',
  'sem-sessao': 'Conta de exemplo, sem sessão',
} as const

export type Fixture = keyof typeof FIXTURES

export function criarFixture(fixture: Fixture): MockDb {
  return {
    versao: 3,
    conta: { ...CONTA_FIXTURE },
    hasSessao: fixture === 'com-sessao',
  }
}

import { type MockDb, avisarMudanca, gravarDb, lerDb, limparDb } from './db'
import { CONTA_FIXTURE, type Fixture, criarFixture } from './fixtures'

export { onMudanca } from './db'
export type { ContaMock, MockDb } from './db'
export { CONTA_FIXTURE } from './fixtures'

// Sem conta e sem sessão: tudo nasce do que a pessoa faz na aplicação.
const vazio = (): MockDb => ({
  versao: 3,
  conta: null,
  hasSessao: false,
})

export function readDb(): MockDb {
  return lerDb(vazio)
}

export function writeDb(update: (db: MockDb) => MockDb | void): MockDb {
  const db = readDb()
  const novo = update(db) ?? db
  gravarDb(novo)
  return structuredClone(novo)
}

// Ferramenta de desenvolvimento: volta ao começo, sem conta.
export function apagarTudo(): void {
  limparDb()
  avisarMudanca()
}

// Ferramenta de desenvolvimento: sem tela de cadastro, é assim que passa a existir uma conta para
// entrar. Substitui a conta anterior, se houver, e começa sem sessão.
export function criarContaDeExemplo(): void {
  writeDb((db) => {
    db.conta = { ...CONTA_FIXTURE }
    db.hasSessao = false
  })
  avisarMudanca()
}

// Só para testes: monta um estado conhecido sem passar pelas telas.
export function aplicarFixture(fixture: Fixture): void {
  gravarDb(criarFixture(fixture))
}

// Atraso de rede fingido, para estados de carregamento aparecerem como vão aparecer de verdade.
export function simularLatencia(ms = 250): Promise<void> {
  if (process.env.NODE_ENV === 'test') return Promise.resolve()
  return new Promise((resolve) => setTimeout(resolve, ms))
}

import { apagarTodasAsCopias } from './copias'
import { type MockDb, avisarMudanca, gravarDb, lerDb, limparDb } from './db'
import { type Fixture, criarFixture } from './fixtures'

export { apagarCopia, lerCopia, medirUsoDoStorage, salvarCopia } from './copias'
export { onMudanca } from './db'
export type { AtividadeMock, ComprovanteMock, ContaMock, MockDb } from './db'

// Sem conta, sem sessão, sem atividades: tudo nasce do que a pessoa faz na aplicação.
const vazio = (): MockDb => ({
  versao: 2,
  conta: null,
  hasSessao: false,
  atividades: [],
  shouldFalharProximoDownload: false,
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

// Ferramenta de desenvolvimento: volta ao começo, sem conta e sem comprovantes.
export function apagarTudo(): void {
  limparDb()
  apagarTodasAsCopias()
  avisarMudanca()
}

// Só para testes: monta um estado conhecido sem passar pelas telas.
export function aplicarFixture(fixture: Fixture): void {
  apagarTodasAsCopias()
  gravarDb(criarFixture(fixture))
}

export { apagarTodasAsCopias }

// Atraso de rede fingido, para estados de carregamento aparecerem como vão aparecer de verdade.
export function simularLatencia(ms = 250): Promise<void> {
  if (process.env.NODE_ENV === 'test') return Promise.resolve()
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function gerarId(): string {
  return crypto.randomUUID()
}

// Ferramenta de desenvolvimento: faz o próximo download parar no meio.
export function definirFalhaNoDownload(shouldFalhar: boolean): void {
  writeDb((db) => {
    db.shouldFalharProximoDownload = shouldFalhar
  })
}

// Faz o papel do backend enquanto ele não existe. Começa vazio e guarda no localStorage do navegador
// o que a pessoa cria pela aplicação, então sobrevive à navegação e à recarga. Uma conta por navegador.

export type ComprovanteMock = {
  nome: string
  tamanhoBytes: number
  tipo: string
  // Foto guardada em versão reduzida (ver copias.ts). PDF não tem cópia: só nome e tamanho.
  hasCopiaReduzida: boolean
}

export type AtividadeMock = {
  id: string
  itemNumero: number
  nome: string
  quantidade: number
  dataFim: string
  registradaEm: string
  comprovante: ComprovanteMock
}

export type ContaMock = {
  email: string
  senha: string
  nome: string | null
  matricula: string | null
  cursoId: string | null
  ingresso: string | null
  isEmailConfirmado: boolean
  linkEnviadoEm: string
}

export type MockDb = {
  versao: 2
  conta: ContaMock | null
  hasSessao: boolean
  atividades: AtividadeMock[]
  shouldFalharProximoDownload: boolean
}

const STORAGE_KEY = 'saaci:mock'
const EVENTO_MUDOU = 'saaci:mock-mudou'

let memoria: MockDb | null = null

function getStorage(): Storage | null {
  return typeof window === 'undefined' ? null : window.localStorage
}

export function lerDb(fallback: () => MockDb): MockDb {
  const storage = getStorage()
  const salvo = storage?.getItem(STORAGE_KEY)

  if (salvo) {
    const db = JSON.parse(salvo) as MockDb
    if (db.versao === 2) return structuredClone(db)
  }

  memoria ??= fallback()
  return structuredClone(memoria)
}

export function gravarDb(db: MockDb): void {
  memoria = structuredClone(db)
  getStorage()?.setItem(STORAGE_KEY, JSON.stringify(db))
}

export function avisarMudanca(): void {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(EVENTO_MUDOU))
}

export function onMudanca(callback: () => void): () => void {
  window.addEventListener(EVENTO_MUDOU, callback)
  return () => window.removeEventListener(EVENTO_MUDOU, callback)
}

export function limparDb(): void {
  memoria = null
  getStorage()?.removeItem(STORAGE_KEY)
}

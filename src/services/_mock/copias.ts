// Cópias reduzidas dos comprovantes, uma chave por atividade, fora do banco principal: o banco
// continua leve e a cópia some junto com a atividade.

const PREFIXO = 'saaci:comprovante:'

function getStorage(): Storage | null {
  return typeof window === 'undefined' ? null : window.localStorage
}

// Devolve false quando o navegador não tem espaço: a atividade é salva mesmo assim, sem a cópia.
export function salvarCopia(id: string, dataUrl: string): boolean {
  try {
    getStorage()?.setItem(PREFIXO + id, dataUrl)
    return getStorage() !== null
  } catch {
    return false
  }
}

export function lerCopia(id: string): string | null {
  return getStorage()?.getItem(PREFIXO + id) ?? null
}

export function apagarCopia(id: string): void {
  getStorage()?.removeItem(PREFIXO + id)
}

export function apagarTodasAsCopias(): void {
  const storage = getStorage()
  if (!storage) return

  Object.keys(storage)
    .filter((chave) => chave.startsWith(PREFIXO))
    .forEach((chave) => storage.removeItem(chave))
}

// Quanto o SAACI ocupa no localStorage, em bytes (o navegador guarda texto em UTF-16).
export function medirUsoDoStorage(): number {
  const storage = getStorage()
  if (!storage) return 0

  return Object.keys(storage)
    .filter((chave) => chave.startsWith('saaci:'))
    .reduce((soma, chave) => soma + (chave.length + (storage.getItem(chave)?.length ?? 0)) * 2, 0)
}

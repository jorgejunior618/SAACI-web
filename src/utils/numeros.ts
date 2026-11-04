// "40", "1,5" ou "1.5" → número. Devolve null quando não é número positivo.
export function parseNumero(texto: string): number | null {
  const normalizado = texto.trim().replace(',', '.')
  if (!/^\d+(\.\d+)?$/.test(normalizado)) return null

  const valor = Number(normalizado)
  return valor > 0 ? valor : null
}

// Mostra a quantidade digitada sem casas inúteis: 40 → "40", 1.5 → "1,5".
export function formatNumero(valor: number): string {
  return valor.toLocaleString('pt-BR', { maximumFractionDigits: 2 })
}

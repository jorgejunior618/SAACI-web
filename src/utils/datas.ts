const pad = (n: number): string => String(n).padStart(2, '0')

// ISO "2025-05-03" → "03/05/2025".
export function formatData(iso: string): string {
  const [ano, mes, dia] = iso.slice(0, 10).split('-')
  return `${dia}/${mes}/${ano}`
}

// "31/10/2026, 15:30"
export function formatDataHora(date: Date): string {
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}, ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

// "03/05/2025" → ISO "2025-05-03". Devolve null quando a data não existe no calendário.
export function parseData(texto: string): string | null {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(texto.trim())
  if (!match) return null

  const [, dia, mes, ano] = match.map(Number)
  const date = new Date(Date.UTC(ano, mes - 1, dia))
  const isReal =
    date.getUTCFullYear() === ano && date.getUTCMonth() === mes - 1 && date.getUTCDate() === dia

  return isReal ? `${ano}-${pad(mes)}-${pad(dia)}` : null
}

export function hojeIso(): string {
  const hoje = new Date()
  return `${hoje.getFullYear()}-${pad(hoje.getMonth() + 1)}-${pad(hoje.getDate())}`
}

// "1,2 MB", "420 KB". Base 1024, como o celular mostra.
export function formatTamanho(bytes: number): string {
  const kb = bytes / 1024
  if (kb < 1024) return `${Math.max(1, Math.round(kb))} KB`

  const mb = kb / 1024
  return `${mb.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} MB`
}

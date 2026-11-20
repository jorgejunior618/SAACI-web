const BYTES_PER_MB = 1024 * 1024

const numberFormat = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 })

/**
 * Escreve o tamanho de um arquivo em português ("1,2 MB").
 *
 * @param bytes Tamanho em bytes.
 * @returns O tamanho em B, KB ou MB, com vírgula decimal.
 *
 * @example
 * ```ts
 * formatFileSize(1.2 * 1024 * 1024) // '1,2 MB'
 * ```
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < BYTES_PER_MB) return `${numberFormat.format(bytes / 1024)} KB`

  return `${numberFormat.format(bytes / BYTES_PER_MB)} MB`
}

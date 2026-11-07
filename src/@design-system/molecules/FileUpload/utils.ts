const BYTES_PER_MB = 1024 * 1024

const TYPE_NAMES: Record<string, string> = {
  'application/pdf': 'PDF',
  'image/jpeg': 'JPG',
  'image/png': 'PNG',
}

const numberFormat = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 })

/**
 * Escreve o tamanho de um arquivo em português ("1,2 MB").
 *
 * @param bytes Tamanho em bytes.
 * @returns O tamanho em B, KB ou MB, com vírgula decimal.
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < BYTES_PER_MB) return `${numberFormat.format(bytes / 1024)} KB`

  return `${numberFormat.format(bytes / BYTES_PER_MB)} MB`
}

/** Nomes dos formatos aceitos para a frase de erro ("PDF, JPG ou PNG"). */
function describeTypes(accept: string[]): string {
  const names = accept.map((type) => TYPE_NAMES[type] ?? type.split('/')[1]?.toUpperCase() ?? type)

  return new Intl.ListFormat('pt-BR', { style: 'long', type: 'disjunction' }).format(names)
}

/**
 * Confere um arquivo escolhido antes de entregá-lo à tela.
 *
 * @remarks
 * É só ajuda para a pessoa corrigir na hora. O tipo vem do navegador e pode ser forjado, então a
 * regra de verdade é do Storage.
 *
 * @param file Arquivo escolhido.
 * @param accept Tipos MIME aceitos ("application/pdf").
 * @param maxSizeMb Limite de tamanho em MB.
 * @returns A frase de erro com o motivo e o próximo passo, ou `null` quando o arquivo serve.
 */
export function validateFile(file: File, accept: string[], maxSizeMb: number): string | null {
  if (file.size === 0) {
    return 'Esse arquivo está vazio. Escolha outro arquivo ou tire a foto de novo.'
  }

  if (!accept.includes(file.type)) {
    return `Esse tipo de arquivo não funciona aqui. Envie em ${describeTypes(accept)}.`
  }

  if (file.size > maxSizeMb * BYTES_PER_MB) {
    return `Esse arquivo tem ${formatFileSize(file.size)} e o limite é ${maxSizeMb} MB. Escolha um arquivo menor ou tire a foto de novo.`
  }

  return null
}

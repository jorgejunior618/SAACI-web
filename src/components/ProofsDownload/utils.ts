import type { Activity } from '@/services/activities'
import type { RuleItem } from '@/services/rules'
import { isCounting } from '@/utils/is-counting'

/** Um comprovante que entra no arquivo compactado, com o caminho dele lá dentro. */
export type ProofEntry = {
  activity: Activity
  /** Pasta do item e nome do arquivo: `Item 06 - Curso de línguas/Curso de inglês.pdf`. */
  path: string
}

const MAX_NAME_LENGTH = 60

// Tira o que sistema de arquivo recusa (Windows é o mais exigente) e encurta nomes longos.
function toFileName(name: string): string {
  const clean = name
    .replace(/[\\/:*?"<>|]/g, '')
    .replace(/\s+/g, ' ')
    .trim()

  return clean.slice(0, MAX_NAME_LENGTH).trim() || 'comprovante'
}

/**
 * Lista os comprovantes que contam e o caminho de cada um no arquivo compactado, uma pasta por item.
 *
 * @remarks
 * Entra quem conta inteiro ou em parte (`isCounting`). A pasta leva o número do item com dois
 * dígitos, para a ordem do formulário se manter no explorador de arquivos. O arquivo leva o nome
 * da atividade e a extensão do comprovante. Nome repetido na mesma pasta ganha " (2)", " (3)".
 *
 * @param activities Atividades do aluno, na ordem do service.
 * @param ruleItems Itens do curso, para o nome da pasta.
 * @returns Os comprovantes que entram, na ordem recebida.
 *
 * @example
 * ```ts
 * getProofEntries(activities, ruleItems)[0].path
 * // "Item 06 - Curso de línguas/Curso de inglês intermediário.pdf"
 * ```
 */
export function getProofEntries(activities: Activity[], ruleItems: RuleItem[]): ProofEntry[] {
  const used = new Set<string>()

  return activities.filter(isCounting).map((activity) => {
    const item = ruleItems.find((rule) => rule.itemNumber === activity.itemNumber)
    const itemNumber = String(activity.itemNumber).padStart(2, '0')
    const folder = toFileName(`Item ${itemNumber} - ${item?.name ?? 'Sem nome'}`)
    const base = `${folder}/${toFileName(activity.name)}`
    const extension = `.${activity.proof.type}`

    let path = `${base}${extension}`
    for (let copy = 2; used.has(path); copy += 1) path = `${base} (${copy})${extension}`
    used.add(path)

    return { activity, path }
  })
}

const megabytes = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})

/**
 * Escreve um tamanho em megabytes, com uma casa ("6,4 MB").
 *
 * @remarks
 * Usa 1 MB = 1024 × 1024 bytes, a mesma conta do limite de 10 MB do comprovante.
 *
 * @param bytes Tamanho em bytes.
 * @param options `hasUnit: false` tira o " MB", para escrever "2,9 de 6,4 MB".
 * @returns O texto, por exemplo `"6,4 MB"`. Arquivo pequeno aparece como `"0,1 MB"`, nunca `"0,0 MB"`.
 */
export function formatMegabytes(bytes: number, { hasUnit = true } = {}): string {
  const value = megabytes.format(bytes > 0 ? Math.max(bytes / (1024 * 1024), 0.1) : 0)

  return hasUnit ? `${value} MB` : value
}

/**
 * Escreve quantos arquivos são ("1 arquivo", "8 arquivos").
 *
 * @param count Quantidade de arquivos.
 * @returns O texto no singular ou no plural.
 */
export function formatFileCount(count: number): string {
  return `${count} ${count === 1 ? 'arquivo' : 'arquivos'}`
}

/**
 * Avisa quais comprovantes não contam e ficam fora do arquivo compactado.
 *
 * @param activities Todas as atividades do aluno.
 * @returns A frase com os nomes, ou `null` quando todos contam.
 *
 * @example
 * ```ts
 * formatLeftOut(activities)
 * // "1 comprovante não conta e fica de fora: Palestra de boas-vindas aos calouros."
 * ```
 */
export function formatLeftOut(activities: Activity[]): string | null {
  const names = activities.filter((a) => !isCounting(a)).map((a) => a.name)

  if (names.length === 0) return null

  const list =
    names.length === 1 ? names.join('') : `${names.slice(0, -1).join(', ')} e ${names.at(-1)}`
  const verb =
    names.length === 1 ? 'comprovante não conta e fica' : 'comprovantes não contam e ficam'

  return `${names.length} ${verb} de fora: ${list}.`
}

/**
 * Texto do botão de download no modo de seleção ("Baixar 1 selecionado", "Baixar 3 selecionados").
 *
 * @param count Quantos comprovantes estão marcados.
 * @returns O texto no singular ou no plural.
 */
export function formatSelectedLabel(count: number): string {
  return `Baixar ${count} ${count === 1 ? 'selecionado' : 'selecionados'}`
}

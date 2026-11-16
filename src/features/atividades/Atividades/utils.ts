import type { Activity } from '@/services/activities'
import type { ProgressCategory } from '@/services/progress'
import type { RuleItem } from '@/services/rules'

/** Um item do formulário com as atividades do aluno nele, como a seção "Por item" mostra. */
export type ItemGroup = {
  itemNumber: number
  /** Nome do item, vindo das regras do curso. */
  name: string
  /** Horas do item que contam no total, vindas do progresso. `0` quando nenhuma conta. */
  countedHours: number
  /** Máximo de horas do item. */
  maxHours: number
  /** Atividades do item, na ordem do service (data de término). */
  activities: Activity[]
}

/**
 * Lê o número do item do endereço (`/atividades?item=7`), que o Início usa para abrir um item.
 *
 * @param value O valor cru de `searchParams.item`.
 * @returns O número do item, ou `null` quando falta ou não é um número inteiro positivo.
 */
export function parseItemParam(value: string | string[] | undefined): number | null {
  const raw = Array.isArray(value) ? value[0] : value
  const itemNumber = Number(raw)

  return Number.isInteger(itemNumber) && itemNumber > 0 ? itemNumber : null
}

/**
 * Agrupa as atividades por item, na ordem do formulário do curso.
 *
 * @remarks
 * Não soma horas: as horas de cada item vêm prontas de `progress.categories` (RNF20). Item em que
 * nenhuma atividade conta não aparece no progresso e fica com `0`. Item sem atividade não vira grupo.
 *
 * @param activities Atividades do aluno, já ordenadas pelo service.
 * @param ruleItems Itens do formulário do curso, para o nome e o máximo.
 * @param categories Horas por item, de `getProgress`.
 * @returns Um grupo por item com atividade.
 */
export function groupActivitiesByItem(
  activities: Activity[],
  ruleItems: RuleItem[],
  categories: ProgressCategory[],
): ItemGroup[] {
  return ruleItems.flatMap((item) => {
    const itemActivities = activities.filter((a) => a.itemNumber === item.itemNumber)

    if (itemActivities.length === 0) return []

    const category = categories.find((c) => c.itemNumber === item.itemNumber)

    return [
      {
        itemNumber: item.itemNumber,
        name: item.name,
        countedHours: category?.countedHours ?? 0,
        maxHours: item.maxHours,
        activities: itemActivities,
      },
    ]
  })
}

/**
 * Indica se o comprovante da atividade conta no total, inteiro ou em parte.
 *
 * @param activity Atividade com o `status` do cálculo único.
 * @returns `true` para `conta` e `parcial`.
 */
export function isCounting(activity: Activity): boolean {
  return activity.status !== 'nao_conta'
}

/**
 * Escreve a linha de resumo dos comprovantes ("8 comprovantes contam, em 4 itens. 1 não conta.").
 *
 * @remarks
 * Só conta atividades pelo `status` que o service devolveu: não decide o que conta.
 *
 * @param activities Todas as atividades do aluno.
 * @returns O texto do resumo, no singular ou no plural.
 */
export function formatProofsSummary(activities: Activity[]): string {
  const counting = activities.filter(isCounting)
  const notCounting = activities.length - counting.length
  const itemCount = new Set(counting.map((a) => a.itemNumber)).size

  const countingText =
    counting.length === 0
      ? 'Nenhum comprovante conta ainda.'
      : `${counting.length} ${counting.length === 1 ? 'comprovante conta' : 'comprovantes contam'}, em ${itemCount} ${itemCount === 1 ? 'item' : 'itens'}.`

  if (notCounting === 0) return countingText

  return `${countingText} ${notCounting} ${notCounting === 1 ? 'não conta' : 'não contam'}.`
}

/**
 * Diz, em poucas palavras, por que a atividade não conta.
 *
 * @param reason O `reason` do cálculo único.
 * @returns O motivo como o aluno lê na linha da atividade.
 */
export function formatReason(reason: Activity['reason']): string {
  return reason === 'antes_do_ingresso' ? 'antes do seu ingresso' : 'item já no máximo'
}

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
 * @param options `withUnit: false` tira o " MB", para escrever "2,9 de 6,4 MB".
 * @returns O texto, por exemplo `"6,4 MB"`. Arquivo pequeno aparece como `"0,1 MB"`, nunca `"0,0 MB"`.
 */
export function formatMegabytes(bytes: number, { withUnit = true } = {}): string {
  const value = megabytes.format(bytes > 0 ? Math.max(bytes / (1024 * 1024), 0.1) : 0)

  return withUnit ? `${value} MB` : value
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
 * Lista os ids das atividades cujo comprovante conta, para a seleção começar com todas marcadas.
 *
 * @param activities Todas as atividades do aluno.
 * @returns Os ids, na ordem recebida.
 */
export function getCountingIds(activities: Activity[]): string[] {
  return activities.filter(isCounting).map((activity) => activity.id)
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

/**
 * Indica se todas as atividades que contam de um item estão marcadas.
 *
 * @param selectedIds Atividades marcadas.
 * @param itemIds Ids das atividades que contam no item.
 * @returns `true` quando há atividade e todas estão marcadas.
 */
export function isItemFullySelected(selectedIds: ReadonlySet<string>, itemIds: string[]): boolean {
  return itemIds.length > 0 && itemIds.every((id) => selectedIds.has(id))
}

/**
 * Marca ou desmarca de uma vez as atividades que contam de um item.
 *
 * @remarks
 * Com todas marcadas, desmarca todas. Com qualquer uma desmarcada, marca todas. As marcas de outros
 * itens não mudam.
 *
 * @param selectedIds Atividades marcadas agora.
 * @param itemIds Ids das atividades que contam no item.
 * @returns Uma seleção nova. A recebida não é alterada.
 */
export function toggleItemSelection(
  selectedIds: ReadonlySet<string>,
  itemIds: string[],
): Set<string> {
  const next = new Set(selectedIds)
  const shouldSelect = !isItemFullySelected(selectedIds, itemIds)

  for (const id of itemIds) {
    if (shouldSelect) next.add(id)
    else next.delete(id)
  }
  return next
}

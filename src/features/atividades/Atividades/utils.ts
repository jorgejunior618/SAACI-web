import type { Activity } from '@/services/activities'
import type { ProgressCategory } from '@/services/progress'
import type { RuleItem } from '@/services/rules'
import { formatHours } from '@/utils/format-hours'
import { isCounting } from '@/utils/is-counting'

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
 * Lê o nome da atividade removida do endereço (`/atividades?removida=…`), que o Detalhe manda depois
 * de remover.
 *
 * @param value O valor cru de `searchParams.removida`.
 * @returns O nome, sem espaços nas pontas, ou `null` quando falta ou está em branco.
 */
export function parseRemovedParam(value: string | string[] | undefined): string | null {
  const raw = (Array.isArray(value) ? value[0] : value)?.trim()

  return raw ? raw : null
}

/**
 * Escreve o aviso de remoção confirmada: quem saiu, o total novo e quanto falta.
 *
 * @param name Nome da atividade removida.
 * @param totalHours Total atual, de `progressQueries.summary`, já sem a atividade.
 * @param missingHours Quanto falta para a meta, do mesmo resumo.
 * @returns O corpo do aviso "Atividade removida".
 */
export function describeRemoved(name: string, totalHours: number, missingHours: number): string {
  const format = (hours: number): string => formatHours(hours, { fractionDigits: 'auto' })
  const next =
    missingHours > 0
      ? `Faltam ${format(missingHours)} para completar suas horas.`
      : 'Suas horas continuam completas.'

  return `${name} saiu do seu total, que agora é ${format(totalHours)}. ${next}`
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
  const isSelecting = !isItemFullySelected(selectedIds, itemIds)

  for (const id of itemIds) {
    if (isSelecting) next.add(id)
    else next.delete(id)
  }
  return next
}

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

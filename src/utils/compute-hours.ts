import type { Activity, ActivityStatus } from '@/services/activities'
import type { Progress, ProgressCategory } from '@/services/progress'
import type { RuleItem } from '@/services/rules'

/** O que o cálculo precisa de uma atividade: o dado bruto, sem nada derivado. */
export type HoursActivityInput = Pick<
  Activity,
  'id' | 'itemNumber' | 'quantity' | 'registeredAt'
> & {
  /** Data em que a atividade começou. Decide o ingresso. */
  startDate: string
}

/** O que o cálculo precisa de um item do formulário: a razão e o máximo. */
export type HoursRuleInput = Pick<RuleItem, 'itemNumber' | 'name' | 'ratio' | 'maxHours'>

/** Quanto uma atividade conta, e por que, depois da razão, do ingresso e do máximo do item. */
export type ActivityHours = Pick<Activity, 'id' | 'countedHours' | 'status' | 'reason'>

/** Entrada de {@link computeProgress}. */
export type ProgressInput = {
  activities: HoursActivityInput[]
  ruleItems: HoursRuleInput[]
  /** Semestre de ingresso do perfil. `null` (perfil incompleto) faz nada contar. */
  startSemester: string | null
  /** Carga total que o curso pede, em horas inteiras. */
  targetHours: number
}

// Evita que 0,94 × 5 × 10 = 46,999… vire 4,6h ao truncar, quando o certo é 4,7h. Fica muitas ordens
// abaixo de um décimo de hora, então nunca empurra uma conta legítima para o décimo seguinte.
const EPSILON = 1e-9

/** Horas brutas da atividade em décimos inteiros, truncadas para baixo. */
function rawTenths(quantity: number, ratio: HoursRuleInput['ratio']): number {
  return Math.floor((quantity * ratio.hours * 10) / ratio.per + EPSILON)
}

function toHours(tenths: number): number {
  return tenths / 10
}

type ItemResult = { activities: ActivityHours[]; countedTenths: number; overTenths: number }

function computeItem(
  rule: HoursRuleInput,
  activities: HoursActivityInput[],
  startSemester: string | null,
): ItemResult {
  let remaining = Math.round(rule.maxHours * 10)
  let countedTenths = 0
  let overTenths = 0
  const ordered = [...activities].sort(
    (a, b) => a.registeredAt.localeCompare(b.registeredAt) || a.id.localeCompare(b.id),
  )

  const results = ordered.map((activity): ActivityHours => {
    if (startSemester === null || activity.startDate < startSemester) {
      return { id: activity.id, countedHours: 0, status: 'nao_conta', reason: 'antes_do_ingresso' }
    }

    const raw = rawTenths(activity.quantity, rule.ratio)
    const counted = Math.min(raw, remaining)

    remaining -= counted
    countedTenths += counted
    overTenths += raw - counted

    if (counted === raw) {
      return { id: activity.id, countedHours: toHours(counted), status: 'conta', reason: null }
    }

    const status: ActivityStatus = counted > 0 ? 'parcial' : 'nao_conta'

    return { id: activity.id, countedHours: toHours(counted), status, reason: 'item_cheio' }
  })

  return { activities: results, countedTenths, overTenths }
}

function groupByItem(activities: HoursActivityInput[]): Map<number, HoursActivityInput[]> {
  const groups = new Map<number, HoursActivityInput[]>()

  for (const activity of activities) {
    const group = groups.get(activity.itemNumber) ?? []

    group.push(activity)
    groups.set(activity.itemNumber, group)
  }
  return groups
}

function findRule(ruleItems: HoursRuleInput[], itemNumber: number): HoursRuleInput {
  const rule = ruleItems.find((item) => item.itemNumber === itemNumber)

  if (!rule) throw new Error(`Atividade no item ${itemNumber}, que não existe nas regras do curso.`)
  return rule
}

/**
 * Calcula quanto cada atividade conta, pela razão do item, pelo ingresso e pelo máximo do item.
 *
 * @remarks
 * É o cálculo único de horas. Hoje é usado pelo mock e, depois, pela prévia do
 * formulário. A tela nunca refaz a conta. As regras:
 * - Cada atividade conta `quantity × hours / per`, truncado em uma casa decimal.
 * - Conta só se `startDate >= startSemester`. A que não conta pelo ingresso não ocupa o máximo.
 * - Dentro do item, quem foi registrado primeiro garante as horas. A que passa do máximo fica
 *   `parcial`, e as seguintes ficam `nao_conta`, ambas com o motivo `item_cheio`.
 *
 * O resultado depende da lista inteira, porque o máximo é dividido entre as atividades do item.
 * Calcule sempre sobre todas as atividades do aluno, nunca sobre uma só.
 *
 * @param activities Todas as atividades do aluno, com o dado bruto.
 * @param ruleItems Itens do curso do aluno, de `getRuleItems`.
 * @param startSemester Semestre de ingresso do perfil. `null` faz nada contar.
 * @returns Uma entrada por atividade, na ordem recebida.
 * @throws {Error} Uma atividade aponta para um item que não está em `ruleItems`.
 *
 * @example
 * ```ts
 * const [hours] = computeActivities(
 *   [{ id: 'a', itemNumber: 6, quantity: 60, startDate: '2025-03-01', registeredAt: '2025-06-30T12:00:00.000Z' }],
 *   await getRuleItems('engenharia-de-computacao'),
 *   '2023-07-01',
 * )
 * // hours → { id: 'a', countedHours: 15, status: 'conta', reason: null }
 * ```
 */
export function computeActivities(
  activities: HoursActivityInput[],
  ruleItems: HoursRuleInput[],
  startSemester: string | null,
): ActivityHours[] {
  const byId = new Map<string, ActivityHours>()

  for (const [itemNumber, group] of groupByItem(activities)) {
    const item = computeItem(findRule(ruleItems, itemNumber), group, startSemester)

    for (const result of item.activities) byId.set(result.id, result)
  }

  // Toda atividade passou por um grupo acima, então o resultado sempre existe.
  return activities.flatMap((activity) => byId.get(activity.id) ?? [])
}

/**
 * Calcula o progresso do aluno: horas por item, total, meta e quanto falta.
 *
 * @remarks
 * Usa o mesmo cálculo de {@link computeActivities}. O total é a soma dos itens em horas
 * inteiras, truncada para baixo e limitada à meta. `itemsSum` guarda a soma sem o limite.
 * `categories` traz só os itens com horas que contam ou que passaram do máximo, na ordem do formulário.
 *
 * @param input Atividades, regras, semestre de ingresso e meta do curso.
 * @returns O progresso no formato de `getProgress`.
 * @throws {Error} Uma atividade aponta para um item que não está nas regras.
 *
 * @example
 * ```ts
 * const progress = computeProgress({ activities, ruleItems, startSemester: '2023-07-01', targetHours: 120 })
 * // progress.totalHours → 59, progress.missingHours → 61
 * ```
 */
export function computeProgress({
  activities,
  ruleItems,
  startSemester,
  targetHours,
}: ProgressInput): Progress {
  const groups = groupByItem(activities)
  const categories: ProgressCategory[] = []
  let sumTenths = 0

  for (const itemNumber of groups.keys()) findRule(ruleItems, itemNumber)

  for (const rule of ruleItems) {
    const group = groups.get(rule.itemNumber)

    if (!group) continue
    const item = computeItem(rule, group, startSemester)

    sumTenths += item.countedTenths
    if (item.countedTenths === 0 && item.overTenths === 0) continue
    categories.push({
      itemNumber: rule.itemNumber,
      name: rule.name,
      countedHours: toHours(item.countedTenths),
      maxHours: rule.maxHours,
      hoursOverLimit: toHours(item.overTenths),
    })
  }

  const totalHours = Math.min(Math.floor(sumTenths / 10), targetHours)

  return {
    totalHours,
    targetHours,
    missingHours: targetHours - totalHours,
    itemsSum: toHours(sumTenths),
    categories,
  }
}

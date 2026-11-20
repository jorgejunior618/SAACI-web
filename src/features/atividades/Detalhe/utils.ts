import type { BadgeTone } from '@design-system'

import type { Activity, ActivityCorrection } from '@/services/activities'
import type { RuleItem } from '@/services/rules'
import { describeCalc, formatBrDate } from '@/utils/activity-form'
import type { ActivityFormInput, ActivityFormOutput } from '@/utils/activity-form'
import { compareByRegistration, computeProgress } from '@/utils/compute-hours'
import { formatHours } from '@/utils/format-hours'
import { formatSemester } from '@/utils/start-semester'

/** Linha da tabela "Como foi calculado". */
export type CalcRow = { label: string; value: number }

const STATUS_BADGE: Record<Activity['status'], { tone: BadgeTone; label: string }> = {
  conta: { tone: 'counts', label: 'Conta' },
  parcial: { tone: 'partial', label: 'Conta em parte' },
  nao_conta: { tone: 'doesNotCount', label: 'Não conta' },
}

/**
 * Traduz o status do cálculo para o `Badge` do topo do detalhe.
 *
 * @param status O `status` da atividade, do cálculo único.
 * @returns O tom do `Badge` e o texto ("Conta", "Conta em parte", "Não conta").
 */
export function getStatusBadge(status: Activity['status']): { tone: BadgeTone; label: string } {
  return STATUS_BADGE[status]
}

/**
 * Diz quanto cabia no item para esta atividade: o máximo menos o que as atividades registradas antes
 * dela já contam.
 *
 * @remarks
 * Não recalcula nada: soma o `countedHours` que o service já devolveu (RNF20). Quem vem antes sai
 * do `compareByRegistration`, a ordem do próprio cálculo único: as registradas depois não entram.
 *
 * @param activity A atividade do detalhe.
 * @param activities Todas as atividades do aluno, de `activitiesQueries.list`.
 * @param maxHours Máximo de horas do item.
 * @returns As horas que cabiam, nunca negativas.
 */
export function getRoomHours(activity: Activity, activities: Activity[], maxHours: number): number {
  const used = activities
    .filter(
      (other) =>
        other.id !== activity.id &&
        other.itemNumber === activity.itemNumber &&
        compareByRegistration(other, activity) < 0,
    )
    .reduce((sum, other) => sum + other.countedHours, 0)

  return Math.max(0, maxHours - used)
}

/**
 * Monta as linhas de "Como foi calculado": a conta da razão e o espaço do item (ou o ingresso).
 *
 * @param activity A atividade do detalhe.
 * @param rule O item do curso em que ela está.
 * @param roomHours O que cabia no item, de {@link getRoomHours}.
 * @returns As linhas, sem a de total, que a tela mostra à parte.
 */
export function getCalcRows(activity: Activity, rule: RuleItem, roomHours: number): CalcRow[] {
  const calc = { label: describeCalc(activity.quantity, rule.ratio), value: activity.activityHours }

  if (activity.reason === 'antes_do_ingresso') {
    return [calc, { label: 'Antes do ingresso', value: 0 }]
  }

  const verb = roomHours === 1 ? 'Cabia' : 'Cabiam'

  return [calc, { label: `${verb} no item ${rule.itemNumber}`, value: roomHours }]
}

/**
 * Explica, em uma frase, por que a atividade conta inteira, em parte ou não conta.
 *
 * @param activity A atividade do detalhe.
 * @param rule O item do curso em que ela está.
 * @param startSemester Semestre de ingresso do perfil (`AAAA-MM-DD`), para o "antes do ingresso".
 * @returns A frase para o cartão de horas.
 */
export function describeWhy(
  activity: Activity,
  rule: RuleItem,
  startSemester: string | null,
): string {
  const limit = `o item ${rule.itemNumber} chegou ao limite de ${formatHours(rule.maxHours, { fractionDigits: 0 })}`

  if (activity.reason === 'antes_do_ingresso') {
    const semester = startSemester ? ` em ${formatSemester(startSemester)}` : ''

    return `Não conta porque começou em ${formatBrDate(activity.startDate)}, antes do seu ingresso${semester}. Só valem atividades feitas depois do ingresso.`
  }
  if (activity.status === 'nao_conta') {
    return `Não conta porque ${limit}. As atividades registradas antes contam primeiro.`
  }
  if (activity.status === 'parcial') {
    const left = activity.activityHours - activity.countedHours

    return `Ficou ${formatHours(left)} de fora porque ${limit}. As atividades registradas antes contam primeiro.`
  }
  return `Conta inteira: o item ${rule.itemNumber} ainda tinha espaço para ela.`
}

/** Entrada de {@link getTotalAfterRemoval}. */
export type RemovalInput = {
  /** A atividade que sai. */
  activity: Activity
  /** Todas as atividades do aluno, de `activitiesQueries.list`. */
  activities: Activity[]
  ruleItems: RuleItem[]
  /** Semestre de ingresso do perfil. */
  startSemester: string | null
  /** Carga total que o curso pede, de `progressQueries.summary`. */
  targetHours: number
}

/**
 * Calcula o total do aluno sem a atividade, com o cálculo único, para a confirmação de remover.
 *
 * @remarks
 * Não subtrai: roda o `computeProgress` sobre a lista sem a atividade (RNF20). Tirar uma atividade
 * pode liberar espaço no item para outra registrada depois, e o total é truncado em horas inteiras e
 * limitado à meta. Por isso "total menos as horas dela" erra.
 *
 * @param input A atividade, a lista inteira, as regras, o ingresso e a meta.
 * @returns O total, em horas inteiras, como `getProgress` devolveria depois da remoção.
 */
export function getTotalAfterRemoval(input: RemovalInput): number {
  return computeProgress({
    activities: input.activities.filter((other) => other.id !== input.activity.id),
    ruleItems: input.ruleItems,
    startSemester: input.startSemester,
    targetHours: input.targetHours,
  }).totalHours
}

/**
 * Escreve a consequência de remover, para o `BottomSheet`: o que acontece com o total e que o
 * comprovante vai junto.
 *
 * @remarks
 * Só escreve: os dois totais vêm prontos, o de depois de {@link getTotalAfterRemoval}.
 *
 * @param name Nome da atividade.
 * @param totalBefore Total atual, de `progressQueries.summary`.
 * @param totalAfter Total sem a atividade.
 * @returns A frase da confirmação. Total igual vira "continua em".
 */
export function describeRemoval(name: string, totalBefore: number, totalAfter: number): string {
  const format = (hours: number): string => formatHours(hours, { fractionDigits: 'auto' })
  const proof = 'O comprovante também é apagado e isso não dá para desfazer.'

  if (totalAfter === totalBefore) {
    return `${name} sai da lista, e seu total continua em ${format(totalBefore)}. ${proof}`
  }
  return `${name} sai do seu total, que volta de ${format(totalBefore)} para ${format(totalAfter)}. ${proof}`
}

const REGISTERED_DATE = new Intl.DateTimeFormat('pt-BR', {
  timeZone: 'America/Fortaleza',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

/**
 * Escreve o dia em que a atividade foi registrada, no fuso do IFCE.
 *
 * @param timestamp O `registeredAt`, em ISO com hora.
 * @returns A data em dd/mm/aaaa.
 */
export function formatRegisteredDate(timestamp: string): string {
  return REGISTERED_DATE.format(new Date(timestamp))
}

/**
 * Escreve a atividade nos campos do formulário, como a pessoa digitaria: quantidade com vírgula e
 * datas em dd/mm/aaaa.
 *
 * @param activity A atividade que a correção abre.
 * @returns Os valores iniciais do formulário de correção.
 */
export function activityToForm(activity: Activity): ActivityFormInput {
  return {
    name: activity.name,
    quantity: String(activity.quantity).replace('.', ','),
    startDate: formatBrDate(activity.startDate),
    endDate: formatBrDate(activity.endDate),
  }
}

/**
 * Monta o "Antes: …" dos campos que o aluno já mudou.
 *
 * @param before Os valores de antes, de {@link activityToForm}.
 * @param current O que está nos campos agora.
 * @returns Um texto por campo alterado. Campo igual ao de antes (sem contar espaços) fica de fora.
 */
export function getPreviousHints(
  before: ActivityFormInput,
  current: ActivityFormInput,
): Partial<Record<keyof ActivityFormInput, string>> {
  const fields = Object.keys(before) as (keyof ActivityFormInput)[]

  return Object.fromEntries(
    fields
      .filter((field) => current[field].trim() !== before[field])
      .map((field) => [field, `Antes: ${before[field]}`]),
  )
}

/**
 * Separa o que a correção muda de fato, para o `updateActivity` gravar só isso.
 *
 * @param activity A atividade como a tela leu.
 * @param values Os campos já validados.
 * @param itemNumber O item escolhido.
 * @returns Os campos diferentes do que está gravado. Vazio quando nada mudou.
 */
export function getCorrection(
  activity: Activity,
  values: ActivityFormOutput,
  itemNumber: number,
): ActivityCorrection {
  const correction: ActivityCorrection = {}

  if (values.name !== activity.name) correction.name = values.name
  if (itemNumber !== activity.itemNumber) correction.itemNumber = itemNumber
  if (values.quantity !== activity.quantity) correction.quantity = values.quantity
  if (values.startDate !== activity.startDate) correction.startDate = values.startDate
  if (values.endDate !== activity.endDate) correction.endDate = values.endDate
  return correction
}

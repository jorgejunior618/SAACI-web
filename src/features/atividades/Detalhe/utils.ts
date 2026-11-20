import type { BadgeTone } from '@design-system'

import type { Activity } from '@/services/activities'
import type { RuleItem } from '@/services/rules'
import { describeCalc, formatBrDate } from '@/utils/activity-form'
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

// Mesma ordem do cálculo único: registro e, no empate, `id`. Quem vem antes ocupa o máximo primeiro.
function isBefore(a: Activity, b: Activity): boolean {
  return (a.registeredAt.localeCompare(b.registeredAt) || a.id.localeCompare(b.id)) < 0
}

/**
 * Diz quanto cabia no item para esta atividade: o máximo menos o que as atividades registradas antes
 * dela já contam.
 *
 * @remarks
 * Não recalcula nada: soma o `countedHours` que o service já devolveu (RNF20). As atividades
 * registradas depois não entram, porque o cálculo dá a vez a quem foi registrado antes.
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
        isBefore(other, activity),
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

/**
 * Escreve a consequência de remover, para o `BottomSheet`: quanto o total perde e que o comprovante
 * vai junto.
 *
 * @param activity A atividade do detalhe.
 * @param totalHours Total atual, de `progressQueries.summary`.
 * @returns A frase da confirmação.
 */
export function describeRemoval(activity: Activity, totalHours: number): string {
  const format = (hours: number): string => formatHours(hours, { fractionDigits: 'auto' })
  const proof = 'O comprovante também é apagado e isso não dá para desfazer.'

  if (activity.countedHours === 0) {
    return `${activity.name} não soma horas, então seu total continua em ${format(totalHours)}. ${proof}`
  }

  const after = Math.max(0, totalHours - activity.countedHours)

  return `${activity.name} sai do seu total, que volta de ${format(totalHours)} para ${format(after)}. ${proof}`
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

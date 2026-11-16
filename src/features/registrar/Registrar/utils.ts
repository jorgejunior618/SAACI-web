import type { RulePanelRow } from '@design-system'

import type { ProofSuggestion } from '@/services/activities'
import type { ProgressCategory } from '@/services/progress'
import type { Ratio, RatioUnit, RuleItem } from '@/services/rules'
import { computeActivities } from '@/utils/compute-hours'
import type { ActivityHours, HoursActivityInput } from '@/utils/compute-hours'
import { formatHours } from '@/utils/format-hours'

import type { ActivityFormInput } from './schema'

/** Formulário em branco, para o início e para a leitura que falhou. */
export const EMPTY_FORM: ActivityFormInput = { name: '', quantity: '', startDate: '', endDate: '' }

const BR_DATE = /^(\d{2})\/(\d{2})\/(\d{4})$/
const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/

/**
 * Converte uma data digitada em dd/mm/aaaa para o formato ISO (aaaa-mm-dd).
 *
 * @param text Data como a pessoa digitou.
 * @returns A data ISO, ou `null` quando o formato está errado ou a data não existe (31/02).
 *
 * @example
 * ```ts
 * parseBrDate('12/09/2026') // '2026-09-12'
 * parseBrDate('31/02/2026') // null
 * ```
 */
export function parseBrDate(text: string): string | null {
  const match = BR_DATE.exec(text.trim())

  if (!match) return null
  const [, day, month, year] = match
  const iso = `${year}-${month}-${day}`
  const date = new Date(`${iso}T00:00:00Z`)

  // `Date` aceita 31/02 e pula para março: conferir o dia de volta pega a data que não existe.
  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== iso ? null : iso
}

/**
 * Escreve uma data ISO (aaaa-mm-dd) como dd/mm/aaaa, para preencher o campo com o que a leitura trouxe.
 *
 * @param iso Data ISO.
 * @returns A data em dd/mm/aaaa. Texto fora do formato ISO volta como veio.
 */
export function formatBrDate(iso: string): string {
  const match = ISO_DATE.exec(iso)

  return match ? `${match[3]}/${match[2]}/${match[1]}` : iso
}

/**
 * Põe as barras da data enquanto a pessoa digita, aceitando só números.
 *
 * @param text Texto do campo depois da última tecla.
 * @returns Até 8 dígitos no formato dd/mm/aaaa, parcial enquanto falta dígito ("12/09").
 *
 * @example
 * ```ts
 * maskBrDate('12092026') // '12/09/2026'
 * maskBrDate('120') // '12/0'
 * ```
 */
export function maskBrDate(text: string): string {
  const digits = text.replace(/\D/g, '').slice(0, 8)

  return [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)].filter(Boolean).join('/')
}

/**
 * Lê a quantidade digitada, aceitando vírgula ou ponto como separador decimal.
 *
 * @param text Quantidade como a pessoa digitou ("40", "2,5").
 * @returns O número, ou `null` quando o texto não é um número.
 */
export function parseQuantity(text: string): number | null {
  const normalized = text.trim().replace(',', '.')

  if (normalized === '' || !/^\d+(\.\d+)?$/.test(normalized)) return null
  return Number(normalized)
}

/**
 * Transforma a sugestão da leitura nos valores do formulário. Campo não lido fica em branco.
 *
 * @param suggestion O que `readProof` devolveu.
 * @returns Os valores para o `reset` do formulário.
 */
export function suggestionToForm(suggestion: ProofSuggestion): ActivityFormInput {
  return {
    name: suggestion.name ?? '',
    quantity: suggestion.quantity === null ? '' : String(suggestion.quantity).replace('.', ','),
    startDate: suggestion.startDate === null ? '' : formatBrDate(suggestion.startDate),
    endDate: suggestion.endDate === null ? '' : formatBrDate(suggestion.endDate),
  }
}

type UnitText = {
  /** Rótulo do campo de quantidade. */
  label: string
  /** Frase do campo não lido, dizendo o que digitar. */
  unreadMessage: string
  /** Como a quantidade aparece na linha do cálculo ("40h", "3 palestras"). */
  describe: (quantity: number) => string
}

function plural(singular: string, pluralForm: string): (quantity: number) => string {
  return (quantity) => `${formatNumber(quantity)} ${quantity === 1 ? singular : pluralForm}`
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 }).format(value)
}

const UNIT_TEXT: Record<RatioUnit, UnitText> = {
  hora: {
    label: 'Horas do certificado',
    unreadMessage: 'Não conseguimos ler as horas. Digite as horas que aparecem no certificado.',
    describe: (quantity) => `${formatNumber(quantity)}h`,
  },
  periodo_letivo: {
    label: 'Quantos períodos letivos',
    unreadMessage: 'Não conseguimos ler os períodos. Digite quantos períodos letivos durou.',
    describe: plural('período letivo', 'períodos letivos'),
  },
  disciplina: {
    label: 'Quantas disciplinas',
    unreadMessage: 'Não conseguimos ler as disciplinas. Digite em quantas você foi monitor.',
    describe: plural('disciplina', 'disciplinas'),
  },
  projeto: {
    label: 'Quantos projetos',
    unreadMessage: 'Não conseguimos ler os projetos. Digite quantos projetos o comprovante cobre.',
    describe: plural('projeto', 'projetos'),
  },
  certificacao: {
    label: 'Quantas certificações',
    unreadMessage: 'Não conseguimos ler as certificações. Digite quantas o comprovante cobre.',
    describe: plural('certificação', 'certificações'),
  },
  evento: {
    label: 'Quantos eventos',
    unreadMessage: 'Não conseguimos ler os eventos. Digite quantos eventos o comprovante cobre.',
    describe: plural('evento', 'eventos'),
  },
  dia_evento: {
    label: 'Quantos dias de evento',
    unreadMessage: 'Não conseguimos ler os dias. Digite quantos dias o evento durou.',
    describe: plural('dia de evento', 'dias de evento'),
  },
  palestra: {
    label: 'Quantas palestras',
    unreadMessage:
      'Não conseguimos ler as palestras. Digite quantas palestras o certificado cobre.',
    describe: plural('palestra', 'palestras'),
  },
  pagina: {
    label: 'Quantas páginas',
    unreadMessage: 'Não conseguimos ler as páginas. Digite quantas páginas tem o relatório.',
    describe: plural('página', 'páginas'),
  },
  publicacao: {
    label: 'Fator Qualis da publicação',
    unreadMessage: 'Não conseguimos ler o fator. Digite o fator Qualis da publicação.',
    describe: (quantity) => `Fator ${formatNumber(quantity)}`,
  },
}

/**
 * Devolve os textos do campo de quantidade conforme a unidade do item ("Horas do certificado",
 * "Quantas palestras").
 *
 * @param unit Unidade da razão do item escolhido.
 * @returns Rótulo e frase do campo não lido.
 */
export function getQuantityText(unit: RatioUnit): Pick<UnitText, 'label' | 'unreadMessage'> {
  const { label, unreadMessage } = UNIT_TEXT[unit]

  return { label, unreadMessage }
}

// "40h ÷ 4", "3 palestras × 2h", "2 projetos × 30h ÷ 2": a conta da razão, sem o resultado.
function describeCalc(quantity: number, ratio: Ratio): string {
  const amount = UNIT_TEXT[ratio.unit].describe(quantity)
  const times = ratio.hours === 1 && ratio.per !== 1 ? '' : ` × ${formatHours(ratio.hours)}`
  const divided = ratio.per === 1 ? '' : ` ÷ ${formatNumber(ratio.per)}`

  return `${amount}${times}${divided}`
}

/** Prévia do quanto a atividade vai contar, pronta para o `RulePanel` e o rodapé. */
export type ActivityPreview = {
  rule: RuleItem
  /** Horas que já contam no item, de `getProgress`. */
  usedHours: number
  calcRows: RulePanelRow[]
  /** Horas que vão contar. `null` enquanto a quantidade não é um número. */
  willCount: number | null
  /** Resultado do cálculo único para o rascunho. `null` enquanto a quantidade não é um número. */
  hours: ActivityHours | null
  warning?: string
}

/** Entrada de {@link buildPreview}. */
export type PreviewInput = {
  /** Todas as atividades do aluno, de `activitiesQueries.list`. */
  activities: HoursActivityInput[]
  ruleItems: RuleItem[]
  /** Horas por item, de `progressQueries.summary`. */
  categories: ProgressCategory[]
  /** Semestre de ingresso do perfil. */
  startSemester: string | null
  itemNumber: number
  /** Quantidade já lida do campo, ou `null` quando ainda não é um número. */
  quantity: number | null
  /** Data de início ISO, ou `null` enquanto o campo não tem data válida. */
  startDate: string | null
}

// O rascunho é sempre o último registrado, como a atividade nova será. Sem data de início ainda,
// supõe que conta pelo ingresso, para a prévia mostrar a razão e o máximo.
const DRAFT_ID = 'rascunho'
const DRAFT_REGISTERED_AT = '9999-12-31T23:59:59.999Z'
const DRAFT_START_FALLBACK = '9999-12-31'

/**
 * Calcula a prévia do registro com o cálculo único: quanto a atividade vale, quanto ainda cabe no
 * item e quanto vai contar.
 *
 * @remarks
 * Roda o `computeActivities` sobre todas as atividades mais o rascunho, como manda a ADR 0003: o
 * máximo do item é dividido entre as atividades, então calcular só o rascunho daria número errado. O
 * valor gravado é o do service; a prévia só informa. O aviso segue a ordem de gravidade: antes do
 * ingresso, item cheio, depois parcial.
 *
 * @param input Atividades, regras, progresso, ingresso e o que o aluno digitou.
 * @returns A prévia para o `RulePanel`.
 * @throws {Error} O item não está em `ruleItems`.
 *
 * @example
 * ```ts
 * const preview = buildPreview({ activities, ruleItems, categories: progress.categories,
 *   startSemester: profile.startSemester, itemNumber: 7, quantity: 40, startDate: '2026-08-03' })
 * // preview.willCount → 10
 * ```
 */
export function buildPreview(input: PreviewInput): ActivityPreview {
  const rule = input.ruleItems.find((item) => item.itemNumber === input.itemNumber)

  if (!rule) throw new Error(`O item ${input.itemNumber} não está nas regras do curso.`)

  const usedHours =
    input.categories.find((category) => category.itemNumber === input.itemNumber)?.countedHours ?? 0
  const remaining = Math.max(0, rule.maxHours - usedHours)
  const fitsRow: RulePanelRow = { label: 'Cabem neste item', value: remaining }

  if (input.quantity === null) {
    return {
      rule,
      usedHours,
      calcRows: [fitsRow],
      willCount: null,
      hours: null,
      warning: 'Digite a quantidade para ver quanto a atividade vai contar.',
    }
  }

  const draft = {
    id: DRAFT_ID,
    itemNumber: input.itemNumber,
    quantity: input.quantity,
    startDate: input.startDate ?? DRAFT_START_FALLBACK,
    registeredAt: DRAFT_REGISTERED_AT,
  }
  const results = computeActivities(
    [...input.activities, draft],
    input.ruleItems,
    input.startSemester,
  )
  const hours = results.find((result) => result.id === DRAFT_ID) ?? null

  if (hours === null) throw new Error('O cálculo não devolveu a prévia do rascunho.')

  return {
    rule,
    usedHours,
    calcRows: [
      { label: describeCalc(input.quantity, rule.ratio), value: hours.activityHours },
      fitsRow,
    ],
    willCount: hours.countedHours,
    hours,
    warning: describeWarning(hours, rule, remaining),
  }
}

function describeWarning(
  hours: ActivityHours,
  rule: RuleItem,
  remaining: number,
): string | undefined {
  if (hours.reason === 'antes_do_ingresso') {
    return 'A atividade começou antes do seu semestre de ingresso. Ela fica guardada, mas não soma horas.'
  }
  if (hours.status === 'nao_conta') {
    return `O item ${rule.itemNumber} já chegou ao limite de ${formatHours(rule.maxHours, { fractionDigits: 0 })}. A atividade fica guardada, mas não soma horas.`
  }
  if (hours.status === 'parcial') {
    return `Essa atividade vale ${formatHours(hours.activityHours)}, mas só cabem mais ${formatHours(remaining)} neste item.`
  }
  return undefined
}

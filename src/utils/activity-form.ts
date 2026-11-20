import * as v from 'valibot'

import { END_BEFORE_START_MESSAGE } from '@/services/activities'
import type { ProgressCategory } from '@/services/progress'
import type { Ratio, RatioUnit, RuleItem } from '@/services/rules'

import { computeActivities } from './compute-hours'
import type { ActivityHours, HoursActivityInput } from './compute-hours'
import { formatHours } from './format-hours'

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
 * Escreve uma data ISO (aaaa-mm-dd) como dd/mm/aaaa, para preencher o campo ou mostrar a data.
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

const DATE_FORMAT_MESSAGE = 'Digite a data no formato dd/mm/aaaa, por exemplo 12/09/2026.'

function dateField(emptyMessage: string) {
  return v.pipe(
    v.string(),
    v.trim(),
    v.nonEmpty(emptyMessage),
    v.check((text) => parseBrDate(text) !== null, DATE_FORMAT_MESSAGE),
    // O `check` acima garante a data; o `?? ''` só existe para o tipo.
    v.transform((text) => parseBrDate(text) ?? ''),
  )
}

/**
 * Campos de texto da atividade: nome, quantidade e as datas de início e fim em dd/mm/aaaa.
 *
 * @remarks
 * Serve ao registro e à correção. A saída já vem no formato do service: quantidade em número e datas
 * ISO. Item e comprovante ficam fora, porque vêm do `ItemPicker` e do `FileUpload`. Cada mensagem
 * diz o que digitar. O fim antes do início aparece no campo do fim.
 */
export const ActivityFormSchema = v.pipe(
  v.object({
    name: v.pipe(
      v.string(),
      v.trim(),
      v.nonEmpty('Digite o nome da atividade, como está no certificado.'),
    ),
    quantity: v.pipe(
      v.string(),
      v.trim(),
      v.nonEmpty('Digite a quantidade que aparece no certificado, por exemplo 40.'),
      v.check((text) => parseQuantity(text) !== null, 'Digite só o número, por exemplo 40 ou 2,5.'),
      v.transform((text) => parseQuantity(text) ?? 0),
      v.minValue(0.1, 'Digite um número maior que zero, por exemplo 40.'),
    ),
    startDate: dateField('Digite a data em que a atividade começou, no formato dd/mm/aaaa.'),
    endDate: dateField('Digite a data em que a atividade terminou, no formato dd/mm/aaaa.'),
  }),
  v.forward(
    v.partialCheck(
      [['startDate'], ['endDate']],
      ({ startDate, endDate }) => endDate >= startDate,
      END_BEFORE_START_MESSAGE,
    ),
    ['endDate'],
  ),
)

/** Campos da atividade como a pessoa digita. */
export type ActivityFormInput = v.InferInput<typeof ActivityFormSchema>
/** Campos da atividade depois da validação, prontos para o service. */
export type ActivityFormOutput = v.InferOutput<typeof ActivityFormSchema>

/** Formulário em branco, para o início do registro e para a leitura que falhou. */
export const EMPTY_FORM: ActivityFormInput = { name: '', quantity: '', startDate: '', endDate: '' }

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

/**
 * Escreve a conta da razão do item, sem o resultado: "40h ÷ 4", "3 palestras × 2,0h".
 *
 * @param quantity Quantidade da atividade, na unidade do item.
 * @param ratio Razão do item, de `rules`.
 * @returns A linha do cálculo, para a tabela do `RulePanel` ou do detalhe.
 *
 * @example
 * ```ts
 * describeCalc(40, { hours: 1, per: 4, unit: 'hora' }) // '40h ÷ 4'
 * ```
 */
export function describeCalc(quantity: number, ratio: Ratio): string {
  const amount = UNIT_TEXT[ratio.unit].describe(quantity)
  const times = ratio.hours === 1 && ratio.per !== 1 ? '' : ` × ${formatHours(ratio.hours)}`
  const divided = ratio.per === 1 ? '' : ` ÷ ${formatNumber(ratio.per)}`

  return `${amount}${times}${divided}`
}

/** Linha da tabela do cálculo. Tem a forma do `RulePanelRow` do design system. */
export type PreviewCalcRow = { label: string; value: number }

/** Prévia do quanto a atividade vai contar, pronta para o `RulePanel` e o rodapé. */
export type ActivityPreview = {
  rule: RuleItem
  /**
   * Horas que outras atividades já ocupam no item. No registro, todas as do item. Na correção, só as
   * registradas antes da corrigida, porque elas ocupam o máximo primeiro.
   */
  usedHours: number
  calcRows: PreviewCalcRow[]
  /** Horas que vão contar. `null` enquanto a quantidade não é um número. */
  willCount: number | null
  /** Resultado do cálculo único para o rascunho. `null` enquanto a quantidade não é um número. */
  hours: ActivityHours | null
  warning?: string
}

/** A atividade que a correção substitui: quem ela é e a ordem de registro dela. */
export type ReplacedActivity = Pick<HoursActivityInput, 'id' | 'registeredAt'>

/** Entrada de {@link buildPreview}. */
export type PreviewInput = {
  /** Todas as atividades do aluno, de `activitiesQueries.list`. */
  activities: HoursActivityInput[]
  ruleItems: RuleItem[]
  /** Horas por item, de `progressQueries.summary`. A correção não usa. */
  categories: ProgressCategory[]
  /** Semestre de ingresso do perfil. */
  startSemester: string | null
  itemNumber: number
  /** Quantidade já lida do campo, ou `null` quando ainda não é um número. */
  quantity: number | null
  /** Data de início ISO, ou `null` enquanto o campo não tem data válida. */
  startDate: string | null
  /**
   * Na correção, a atividade corrigida. Ela sai da lista, e o rascunho fica com o `id` e o
   * `registeredAt` dela. Sem este campo, a prévia é de um registro novo.
   */
  replacing?: ReplacedActivity
}

// O rascunho do registro é sempre o último registrado, como a atividade nova será. Sem data de início
// ainda, supõe que conta pelo ingresso, para a prévia mostrar a razão e o máximo.
const DRAFT_ID = 'rascunho'
const DRAFT_REGISTERED_AT = '9999-12-31T23:59:59.999Z'
const DRAFT_START_FALLBACK = '9999-12-31'

/**
 * Calcula a prévia do registro ou da correção com o cálculo único: quanto a atividade vale, quanto
 * ainda cabe no item e quanto vai contar.
 *
 * @remarks
 * Roda o `computeActivities` sobre todas as atividades mais o rascunho, como manda a ADR 0003: o
 * máximo do item é dividido entre as atividades, então calcular só o rascunho daria número errado.
 * Na correção (`replacing`), o rascunho toma o lugar da atividade corrigida, com o mesmo `id` e
 * `registeredAt`, então fica na mesma ordem: senão ela contaria duas vezes. Ali o "Cabem neste item"
 * desconta só quem foi registrado antes dela, como o cálculo faz, e não o total do progresso. O
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

  const { replacing } = input
  const others = replacing
    ? input.activities.filter((activity) => activity.id !== replacing.id)
    : input.activities
  const usedHours = replacing
    ? hoursBefore(replacing, others, input)
    : (input.categories.find((category) => category.itemNumber === input.itemNumber)
        ?.countedHours ?? 0)
  const remaining = Math.max(0, rule.maxHours - usedHours)
  const fitsRow: PreviewCalcRow = { label: 'Cabem neste item', value: remaining }

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

  const draftId = replacing?.id ?? DRAFT_ID
  const draft = {
    id: draftId,
    itemNumber: input.itemNumber,
    quantity: input.quantity,
    startDate: input.startDate ?? DRAFT_START_FALLBACK,
    registeredAt: replacing?.registeredAt ?? DRAFT_REGISTERED_AT,
  }
  const results = computeActivities([...others, draft], input.ruleItems, input.startSemester)
  const hours = results.find((result) => result.id === draftId) ?? null

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

// Mesma ordem do `computeActivities`: registro e, no empate, `id`.
function isBefore(a: ReplacedActivity, b: ReplacedActivity): boolean {
  return (a.registeredAt.localeCompare(b.registeredAt) || a.id.localeCompare(b.id)) < 0
}

// Horas que as atividades do item registradas antes da corrigida contam. Quem vem depois não muda o
// que vem antes, então calcular sem o rascunho dá o mesmo número.
function hoursBefore(
  replacing: ReplacedActivity,
  others: HoursActivityInput[],
  input: PreviewInput,
): number {
  const earlier = new Set(
    others
      .filter(
        (activity) => activity.itemNumber === input.itemNumber && isBefore(activity, replacing),
      )
      .map((activity) => activity.id),
  )

  return computeActivities(others, input.ruleItems, input.startSemester)
    .filter((result) => earlier.has(result.id))
    .reduce((sum, result) => sum + result.countedHours, 0)
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

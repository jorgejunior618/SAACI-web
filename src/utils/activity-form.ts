import * as v from 'valibot'

// Direto do arquivo de tipos, sem o barrel: o barrel traz mutations e o cliente do Supabase, e
// `utils/` só precisa da mensagem. O ESLint proíbe esse caminho apenas dentro de `features/`.
import { END_BEFORE_START_MESSAGE } from '@/services/activities/activities.types'
import type { Ratio, RatioUnit, RuleItem } from '@/services/rules'

import { parseBrDate } from './br-date'
import { compareByRegistration, computeActivities } from './compute-hours'
import type { ActivityHours, HoursActivityInput } from './compute-hours'
import { formatHours } from './format-hours'

// "1.000" e "1.500": em português, ponto seguido de grupos de três dígitos é milhar. Começar por zero
// ("0.500") não é milhar, então segue como decimal.
const THOUSANDS_PATTERN = /^[1-9]\d{0,2}(\.\d{3})+$/

const THOUSANDS_MESSAGE = 'Para mil, digite 1000. Para decimal, use vírgula, por exemplo 1,5.'

function looksLikeThousands(text: string): boolean {
  return THOUSANDS_PATTERN.test(text.trim())
}

/**
 * Lê a quantidade digitada, aceitando vírgula ou ponto como separador decimal.
 *
 * @remarks
 * O ponto vale como decimal porque alguns teclados numéricos só têm ponto ("2.5" → 2,5). O formato
 * que parece milhar ("1.000", "1.500") é recusado: ler como mil ou como decimal seria adivinhar, e o
 * erro passaria calado para a atividade gravada.
 *
 * @param text Quantidade como a pessoa digitou ("40", "2,5").
 * @returns O número, ou `null` quando o texto não é um número ou parece milhar.
 *
 * @example
 * ```ts
 * parseQuantity('2,5') // 2.5
 * parseQuantity('10.25') // 10.25
 * parseQuantity('1.000') // null
 * ```
 */
export function parseQuantity(text: string): number | null {
  const normalized = text.trim().replace(',', '.')

  if (normalized === '' || !/^\d+(\.\d+)?$/.test(normalized)) return null
  if (looksLikeThousands(normalized)) return null
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
      // Vem antes do check genérico para a mensagem dizer por que "1.000" foi recusado.
      v.check((text) => !looksLikeThousands(text), THOUSANDS_MESSAGE),
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
  /** Rótulo da quantidade nos dados da atividade já registrada ("Palestras"). */
  dataLabel: string
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
    dataLabel: 'Horas do certificado',
    unreadMessage: 'Não conseguimos ler as horas. Digite as horas que aparecem no certificado.',
    describe: (quantity) => `${formatNumber(quantity)}h`,
  },
  periodo_letivo: {
    label: 'Quantos períodos letivos',
    dataLabel: 'Períodos letivos',
    unreadMessage: 'Não conseguimos ler os períodos. Digite quantos períodos letivos durou.',
    describe: plural('período letivo', 'períodos letivos'),
  },
  disciplina: {
    label: 'Quantas disciplinas',
    dataLabel: 'Disciplinas',
    unreadMessage: 'Não conseguimos ler as disciplinas. Digite em quantas você foi monitor.',
    describe: plural('disciplina', 'disciplinas'),
  },
  projeto: {
    label: 'Quantos projetos',
    dataLabel: 'Projetos',
    unreadMessage: 'Não conseguimos ler os projetos. Digite quantos projetos o comprovante cobre.',
    describe: plural('projeto', 'projetos'),
  },
  certificacao: {
    label: 'Quantas certificações',
    dataLabel: 'Certificações',
    unreadMessage: 'Não conseguimos ler as certificações. Digite quantas o comprovante cobre.',
    describe: plural('certificação', 'certificações'),
  },
  evento: {
    label: 'Quantos eventos',
    dataLabel: 'Eventos',
    unreadMessage: 'Não conseguimos ler os eventos. Digite quantos eventos o comprovante cobre.',
    describe: plural('evento', 'eventos'),
  },
  dia_evento: {
    label: 'Quantos dias de evento',
    dataLabel: 'Dias de evento',
    unreadMessage: 'Não conseguimos ler os dias. Digite quantos dias o evento durou.',
    describe: plural('dia de evento', 'dias de evento'),
  },
  palestra: {
    label: 'Quantas palestras',
    dataLabel: 'Palestras',
    unreadMessage:
      'Não conseguimos ler as palestras. Digite quantas palestras o certificado cobre.',
    describe: plural('palestra', 'palestras'),
  },
  pagina: {
    label: 'Quantas páginas',
    dataLabel: 'Páginas',
    unreadMessage: 'Não conseguimos ler as páginas. Digite quantas páginas tem o relatório.',
    describe: plural('página', 'páginas'),
  },
  publicacao: {
    label: 'Fator Qualis da publicação',
    dataLabel: 'Fator Qualis',
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
 * Escreve a quantidade da atividade registrada, com o rótulo da unidade do item.
 *
 * @param quantity Quantidade da atividade.
 * @param unit Unidade da razão do item.
 * @returns O rótulo ("Horas do certificado", "Palestras") e o valor ("40h", "1").
 *
 * @example
 * ```ts
 * describeQuantity(40, 'hora') // { label: 'Horas do certificado', value: '40h' }
 * ```
 */
export function describeQuantity(
  quantity: number,
  unit: RatioUnit,
): { label: string; value: string } {
  const value = unit === 'hora' ? `${formatNumber(quantity)}h` : formatNumber(quantity)

  return { label: UNIT_TEXT[unit].dataLabel, value }
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
   * Horas que as atividades registradas antes do rascunho já contam no item, pela lista de
   * atividades. No registro, todas as do item. Na correção, só as registradas antes da corrigida,
   * porque elas ocupam o máximo primeiro.
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
 * `registeredAt`, então fica na mesma ordem: senão ela contaria duas vezes. No registro, o rascunho
 * é o último registrado. Nos dois casos, o "Cabem neste item" desconta quem foi registrado antes do
 * rascunho, calculado sobre a mesma lista do "Vai contar", para as duas linhas nunca divergirem. O
 * valor gravado é o do service; a prévia só informa. O aviso segue a ordem de gravidade: antes do
 * ingresso, item cheio, depois parcial.
 *
 * @param input Atividades, regras, ingresso e o que o aluno digitou.
 * @returns A prévia para o `RulePanel`.
 * @throws {Error} O item não está em `ruleItems`.
 *
 * @example
 * ```ts
 * const preview = buildPreview({ activities, ruleItems, startSemester: profile.startSemester,
 *   itemNumber: 7, quantity: 40, startDate: '2026-08-03' })
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
  const position: ReplacedActivity = replacing ?? {
    id: DRAFT_ID,
    registeredAt: DRAFT_REGISTERED_AT,
  }
  const usedHours = hoursBefore(position, others, input)
  const remaining = Math.max(0, toTenths(rule.maxHours) - toTenths(usedHours)) / 10
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

  const draft = {
    ...position,
    itemNumber: input.itemNumber,
    quantity: input.quantity,
    startDate: input.startDate ?? DRAFT_START_FALLBACK,
  }
  const results = computeActivities([...others, draft], input.ruleItems, input.startSemester)
  const hours = results.find((result) => result.id === position.id) ?? null

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

function toTenths(hours: number): number {
  return Math.round(hours * 10)
}

// Horas que as atividades do item registradas antes do rascunho contam. Quem vem depois não muda o
// que vem antes, então calcular sem o rascunho dá o mesmo número.
function hoursBefore(
  position: ReplacedActivity,
  others: HoursActivityInput[],
  input: PreviewInput,
): number {
  const earlier = new Set(
    others
      .filter(
        (activity) =>
          activity.itemNumber === input.itemNumber && compareByRegistration(activity, position) < 0,
      )
      .map((activity) => activity.id),
  )

  // Soma em décimos inteiros, como o cálculo único: 0,1 + 0,2 em ponto flutuante não dá 0,3.
  const tenths = computeActivities(others, input.ruleItems, input.startSemester)
    .filter((result) => earlier.has(result.id))
    .reduce((sum, result) => sum + toTenths(result.countedHours), 0)

  return tenths / 10
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

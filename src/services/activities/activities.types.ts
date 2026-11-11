import * as v from 'valibot'

/** Tamanho máximo do comprovante, em bytes. O design fixou 10 MB; falta confirmar. */
export const PROOF_MAX_BYTES = 10 * 1024 * 1024

/** Tipos de arquivo aceitos como comprovante. */
export const PROOF_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png'] as const

/**
 * Se a atividade conta no total. `conta`: inteira. `parcial`: só uma parte coube no item.
 * `nao_conta`: nada conta. O texto do porquê é o `motivo`.
 */
export const ActivityStatusSchema = v.picklist(['conta', 'parcial', 'nao_conta'])

export type ActivityStatus = v.InferOutput<typeof ActivityStatusSchema>

/** Arquivo do comprovante já guardado. A tela abre ou baixa por `getProofUrl`. */
export const ProofSchema = v.object({
  fileName: v.string(),
  sizeBytes: v.pipe(v.number(), v.integer(), v.minValue(0)),
  type: v.picklist(['pdf', 'jpg', 'png']),
})

export type Proof = v.InferOutput<typeof ProofSchema>

/** Mensagem de quando o fim vem antes do início. Diz ao aluno o que fazer a seguir. */
export const END_BEFORE_START_MESSAGE =
  'A data de fim é anterior à de início. Corrija uma das duas datas.'

const IsoDateSchema = v.pipe(v.string(), v.isoDate())

/** Fim igual ou depois do início. Datas ISO comparam certo como texto. */
function endNotBeforeStart(dates: { startDate?: string; endDate?: string }): boolean {
  return dates.startDate === undefined || dates.endDate === undefined
    ? true
    : dates.endDate >= dates.startDate
}

/**
 * Atividade registrada pelo aluno, com o quanto ela conta no total.
 *
 * @remarks
 * `countedHours`, `status` e `reason` são resultado do cálculo único: a tela
 * mostra, nunca recalcula. O nome do item vem de `rules` (`getRuleItems`), não é copiado para cá.
 * `startDate` decide se a atividade conta, `endDate` ordena a lista, `registeredAt` decide
 * quem ocupa o máximo do item e `updatedAt` serve para detectar edição concorrente.
 */
export const ActivitySchema = v.pipe(
  v.object({
    id: v.pipe(v.string(), v.uuid()),
    name: v.string(),
    itemNumber: v.pipe(v.number(), v.integer(), v.minValue(1)),
    /** Horas do certificado ou contagem (palestras, dias, projetos), conforme a regra do item. */
    quantity: v.pipe(v.number(), v.minValue(0)),
    /** Quando a atividade começou. Conta só se for no semestre de ingresso ou depois. */
    startDate: IsoDateSchema,
    /** Quando a atividade terminou. Igual ou depois de `startDate`. */
    endDate: IsoDateSchema,
    registeredAt: v.pipe(v.string(), v.isoTimestamp()),
    updatedAt: v.pipe(v.string(), v.isoTimestamp()),
    countedHours: v.pipe(v.number(), v.minValue(0)),
    status: ActivityStatusSchema,
    reason: v.nullable(v.picklist(['antes_do_ingresso', 'item_cheio'])),
    proof: ProofSchema,
  }),
  v.check((input) => endNotBeforeStart(input), END_BEFORE_START_MESSAGE),
)

export type Activity = v.InferOutput<typeof ActivitySchema>

/** Dados para registrar uma atividade. O arquivo sobe antes e a gravação é completa ou nada. */
export const NewActivitySchema = v.pipe(
  v.object({
    name: v.pipe(v.string(), v.trim(), v.nonEmpty()),
    itemNumber: v.pipe(v.number(), v.integer(), v.minValue(1)),
    quantity: v.pipe(v.number(), v.minValue(0.1)),
    startDate: IsoDateSchema,
    endDate: IsoDateSchema,
    proof: v.pipe(v.instance(File), v.mimeType([...PROOF_MIME_TYPES]), v.maxSize(PROOF_MAX_BYTES)),
  }),
  v.check((input) => endNotBeforeStart(input), END_BEFORE_START_MESSAGE),
)

export type NewActivity = v.InferOutput<typeof NewActivitySchema>

/**
 * Campos de uma atividade que o aluno pode corrigir. O comprovante não se troca.
 *
 * @remarks
 * Com as duas datas enviadas, o schema confere a ordem. Com uma só, quem confere é a escrita, contra
 * a data que ficou (`InvalidActivityDatesError`).
 */
export const ActivityCorrectionSchema = v.pipe(
  v.partial(
    v.object({
      name: v.pipe(v.string(), v.trim(), v.nonEmpty()),
      itemNumber: v.pipe(v.number(), v.integer(), v.minValue(1)),
      quantity: v.pipe(v.number(), v.minValue(0.1)),
      startDate: IsoDateSchema,
      endDate: IsoDateSchema,
    }),
  ),
  v.check((input) => endNotBeforeStart(input), END_BEFORE_START_MESSAGE),
)

export type ActivityCorrection = v.InferOutput<typeof ActivityCorrectionSchema>

/**
 * O que a leitura do comprovante conseguiu extrair. Campo `null` é o que não foi lido: a tela deixa
 * o aluno preencher. A leitura só sugere, nada é registrado por ela.
 */
export const ProofSuggestionSchema = v.object({
  itemNumber: v.nullable(v.pipe(v.number(), v.integer(), v.minValue(1))),
  name: v.nullable(v.string()),
  quantity: v.nullable(v.number()),
  startDate: v.nullable(IsoDateSchema),
  endDate: v.nullable(IsoDateSchema),
})

export type ProofSuggestion = v.InferOutput<typeof ProofSuggestionSchema>

import * as v from 'valibot'

/** Tamanho máximo do comprovante, em bytes. O design fixou 10 MB; */
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

/** Um dos tipos de arquivo de {@link PROOF_MIME_TYPES}. */
type ProofMimeType = (typeof PROOF_MIME_TYPES)[number]

/**
 * Tipo curto de cada tipo de arquivo aceito, que também é a extensão do arquivo no bucket.
 *
 * @remarks
 * O `satisfies` faz o compilador cobrar uma entrada nova quando {@link PROOF_MIME_TYPES} crescer.
 * Sem ele, um tipo novo subiria com extensão errada sem aviso.
 */
export const PROOF_TYPE_BY_MIME = {
  'application/pdf': 'pdf',
  'image/jpeg': 'jpg',
  'image/png': 'png',
} as const satisfies Record<ProofMimeType, Proof['type']>

function isProofMimeType(mime: string): mime is ProofMimeType {
  return (PROOF_MIME_TYPES as readonly string[]).includes(mime)
}

/**
 * Traduz o tipo do arquivo para o tipo curto do comprovante (`pdf`, `jpg` ou `png`).
 *
 * @remarks
 * Uso interno do domínio: a leitura traduz a coluna `comprovante_tipo`, e o registro monta a extensão
 * do caminho no bucket. O schema e o `check` do banco já barram outros tipos, então o erro só aparece
 * se a lista de tipos e o banco divergirem.
 *
 * @param mime Tipo do arquivo, como `application/pdf`.
 * @returns O tipo curto do comprovante.
 * @throws Error quando o tipo não está em {@link PROOF_MIME_TYPES}.
 *
 * @example
 * toProofType('image/jpeg') // 'jpg'
 */
export function toProofType(mime: string): Proof['type'] {
  if (!isProofMimeType(mime)) throw new Error(`Tipo de comprovante não aceito: ${mime}.`)
  return PROOF_TYPE_BY_MIME[mime]
}

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
 * `activityHours`, `countedHours`, `status` e `reason` são resultado do cálculo único: a tela
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
    /**
     * Horas da atividade pela razão do item, antes do ingresso e do máximo. Na atividade `parcial`
     * é o "de 2,0h" de "1,0h de 2,0h".
     */
    activityHours: v.pipe(v.number(), v.minValue(0)),
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

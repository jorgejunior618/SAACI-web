import * as v from 'valibot'

/** Tamanho máximo do comprovante, em bytes: 10 MB (RF31). O bucket `comprovantes` usa o mesmo valor. */
export const PROOF_MAX_BYTES = 10 * 1024 * 1024

/** Tipos de arquivo aceitos como comprovante (RNF25). */
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

/**
 * Atividade registrada pelo aluno, com o quanto ela conta no total.
 *
 * @remarks
 * `countedHours`, `situacao` e `motivo` são resultado do cálculo único (RNF20): a tela mostra, nunca
 * recalcula. O nome do item vem de `rules` (`getRuleItems`), não é copiado para cá. `activityDate`
 * é quando a atividade terminou (RF38), `registeredAt` é quando o aluno a lançou e `updatedAt`
 * serve para detectar edição concorrente.
 */
export const ActivitySchema = v.object({
  id: v.pipe(v.string(), v.uuid()),
  name: v.string(),
  itemNumber: v.pipe(v.number(), v.integer(), v.minValue(1)),
  /** Horas do certificado ou contagem (palestras, dias, projetos), conforme a regra do item. */
  quantity: v.pipe(v.number(), v.minValue(0)),
  activityDate: v.pipe(v.string(), v.isoDate()),
  registeredAt: v.pipe(v.string(), v.isoTimestamp()),
  updatedAt: v.pipe(v.string(), v.isoTimestamp()),
  countedHours: v.pipe(v.number(), v.minValue(0)),
  status: ActivityStatusSchema,
  reason: v.nullable(v.picklist(['antes_do_ingresso', 'item_cheio'])),
  proof: ProofSchema,
})

export type Activity = v.InferOutput<typeof ActivitySchema>

/** Dados para registrar uma atividade. O arquivo sobe antes e a gravação é completa ou nada (RNF24). */
export const NewActivitySchema = v.object({
  name: v.pipe(v.string(), v.trim(), v.nonEmpty()),
  itemNumber: v.pipe(v.number(), v.integer(), v.minValue(1)),
  quantity: v.pipe(v.number(), v.minValue(0.1)),
  activityDate: v.pipe(v.string(), v.isoDate()),
  proof: v.pipe(v.instance(File), v.mimeType([...PROOF_MIME_TYPES]), v.maxSize(PROOF_MAX_BYTES)),
})

export type NewActivity = v.InferOutput<typeof NewActivitySchema>

/** Campos de uma atividade que o aluno pode corrigir. O comprovante não se troca. */
export const ActivityCorrectionSchema = v.partial(
  v.object({
    name: v.pipe(v.string(), v.trim(), v.nonEmpty()),
    itemNumber: v.pipe(v.number(), v.integer(), v.minValue(1)),
    quantity: v.pipe(v.number(), v.minValue(0.1)),
    activityDate: v.pipe(v.string(), v.isoDate()),
  }),
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
  activityDate: v.nullable(v.pipe(v.string(), v.isoDate())),
})

export type ProofSuggestion = v.InferOutput<typeof ProofSuggestionSchema>

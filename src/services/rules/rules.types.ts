import * as v from 'valibot'

/** Curso que já tem as regras de atividades complementares cadastradas. */
export const CourseSchema = v.object({
  id: v.string(),
  name: v.string(),
  degree: v.string(),
  campus: v.string(),
  /** Carga total de atividades complementares que o curso pede, em horas. */
  targetHours: v.number(),
})

export type Course = v.InferOutput<typeof CourseSchema>

/**
 * Unidade em que o aluno informa a `quantity` da atividade, conforme o item.
 *
 * @remarks
 * Mesmos valores do `check` da coluna `itens_curso.unidade`: o banco é a fonte, e o service não
 * traduz. `publicacao`: o aluno informa o fator Qualis da publicação. `[TABELA DO FATOR QUALIS]` a
 * confirmar com a coordenação.
 */
export const RatioUnitSchema = v.picklist([
  'hora',
  'periodo_letivo',
  'disciplina',
  'projeto',
  'certificacao',
  'evento',
  'dia_evento',
  'palestra',
  'pagina',
  'publicacao',
])

export type RatioUnit = v.InferOutput<typeof RatioUnitSchema>

/**
 * Razão de conversão do item: `hours` horas complementares a cada `per` unidades de `unit`.
 *
 * @remarks
 * A atividade conta `quantity × hours / per`, truncado em uma casa decimal, antes do máximo
 * do item. Quem faz a conta é o cálculo único, nunca a tela.
 *
 * @example
 * ```ts
 * // "1h a cada 4h de curso": 60h de curso contam 15h
 * const ratio: Ratio = { hours: 1, per: 4, unit: 'hora' }
 * ```
 */
export const RatioSchema = v.object({
  /** Horas complementares concedidas a cada `per` unidades. */
  hours: v.pipe(v.number(), v.minValue(0)),
  /** Quantas unidades rendem `hours`. Nunca zero. */
  per: v.pipe(v.number(), v.gtValue(0)),
  unit: RatioUnitSchema,
})

export type Ratio = v.InferOutput<typeof RatioSchema>

/**
 * Um dos itens do formulário da coordenação, com a regra de contagem e o máximo.
 *
 * @remarks
 * `rule` é o texto que a tela exibe. A conta usa só `ratio` e `maxHours`: o texto nunca é lido
 * pelo cálculo.
 */
export const RuleItemSchema = v.object({
  itemNumber: v.pipe(v.number(), v.integer(), v.minValue(1)),
  name: v.string(),
  rule: v.string(),
  /** Razão de conversão da quantidade informada em horas complementares. */
  ratio: RatioSchema,
  /** Máximo de horas que o item pode somar no total do aluno. */
  maxHours: v.number(),
})

export type RuleItem = v.InferOutput<typeof RuleItemSchema>

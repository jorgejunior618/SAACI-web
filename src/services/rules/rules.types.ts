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
 * Um dos itens do formulário da coordenação, com a regra de contagem e o máximo.
 *
 * @remarks
 * `regra` é o texto que a tela exibe. A razão de conversão em campos (para o cálculo) entra com a
 * issue do cálculo único de horas, e é um acréscimo ao schema, não uma troca.
 */
export const RuleItemSchema = v.object({
  itemNumber: v.pipe(v.number(), v.integer(), v.minValue(1)),
  name: v.string(),
  rule: v.string(),
  /** Máximo de horas que o item pode somar no total do aluno. */
  maxHours: v.number(),
})

export type RuleItem = v.InferOutput<typeof RuleItemSchema>

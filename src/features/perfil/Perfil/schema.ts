import * as v from 'valibot'

/**
 * Campo de matrícula do Perfil. É opcional: o campo em branco vira `null`, que apaga a matrícula.
 *
 * @remarks
 * Não confere formato, porque o número que entra no formulário da coordenação é o que a pessoa
 * digitar. Espaços nas pontas saem.
 */
export const EnrollmentFormSchema = v.pipe(
  v.string(),
  v.trim(),
  v.transform((text) => (text === '' ? null : text)),
)

/** Matrícula como a pessoa digita, antes da validação. */
export type EnrollmentInput = v.InferInput<typeof EnrollmentFormSchema>
/** Matrícula depois da validação: o texto limpo, ou `null` quando o campo ficou em branco. */
export type EnrollmentOutput = v.InferOutput<typeof EnrollmentFormSchema>

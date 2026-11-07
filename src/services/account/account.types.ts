import * as v from 'valibot'

/**
 * Sessão do aluno. Existe só depois do login ou da confirmação do e-mail.
 *
 * @remarks
 * Curso e semestre não ficam aqui: pertencem ao perfil. A tela decide para onde levar o aluno
 * cruzando a sessão com o perfil.
 */
export const SessionSchema = v.object({
  email: v.pipe(v.string(), v.email()),
  emailConfirmed: v.boolean(),
})

export type Session = v.InferOutput<typeof SessionSchema>

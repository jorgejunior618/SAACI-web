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

/**
 * E-mail de aluno do IFCE (RF02). Ignora espaços nas pontas e maiúsculas, e exige o final
 * `@aluno.ifce.edu.br`.
 *
 * @remarks
 * Os formulários de Acesso usam este schema. O service também confere o domínio no mock, porque a
 * mesma regra vale no servidor.
 */
export const StudentEmailSchema = v.pipe(
  v.string(),
  v.trim(),
  v.toLowerCase(),
  v.email('Digite o e-mail completo, como nome@aluno.ifce.edu.br.'),
  v.endsWith('@aluno.ifce.edu.br', 'Use o e-mail de aluno, o que termina em @aluno.ifce.edu.br.'),
)

export type StudentEmail = v.InferOutput<typeof StudentEmailSchema>

/** Dados do link de nova senha que a tela mostra antes de a pessoa digitar a senha. */
export const PasswordLinkSchema = v.object({
  email: v.pipe(v.string(), v.email()),
})

export type PasswordLink = v.InferOutput<typeof PasswordLinkSchema>

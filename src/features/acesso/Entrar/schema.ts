import * as v from 'valibot'

/**
 * Campos do formulário de Entrar.
 *
 * @remarks
 * O domínio `@aluno.ifce.edu.br` (RF02) só é conferido no cadastro. Aqui, e-mail de outro domínio
 * cai em "senha não confere", como qualquer e-mail sem conta.
 */
export const SignInSchema = v.object({
  email: v.pipe(
    v.string(),
    v.trim(),
    v.toLowerCase(),
    v.nonEmpty('Digite seu e-mail.'),
    v.email('Confira o e-mail e tente de novo.'),
  ),
  password: v.pipe(v.string(), v.nonEmpty('Digite sua senha.')),
})

export type SignInInput = v.InferInput<typeof SignInSchema>
export type SignInOutput = v.InferOutput<typeof SignInSchema>

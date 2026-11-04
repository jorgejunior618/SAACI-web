import * as v from 'valibot'

export const LoginSchema = v.object({
  email: v.pipe(
    v.string(),
    v.trim(),
    v.nonEmpty('Digite o seu e-mail de aluno, por exemplo nome@aluno.ifce.edu.br.'),
  ),
  senha: v.pipe(v.string(), v.nonEmpty('Digite a sua senha.')),
})

export type LoginForm = v.InferOutput<typeof LoginSchema>

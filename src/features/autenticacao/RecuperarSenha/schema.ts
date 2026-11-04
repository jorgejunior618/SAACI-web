import * as v from 'valibot'

import { isEmailAluno } from '@/utils/validacoes'

export const RecuperarSenhaSchema = v.object({
  email: v.pipe(
    v.string(),
    v.trim(),
    v.nonEmpty('Digite o seu e-mail de aluno, por exemplo nome@aluno.ifce.edu.br.'),
    v.check(isEmailAluno, 'Use o e-mail de aluno, que termina em @aluno.ifce.edu.br.'),
  ),
})

export type RecuperarSenhaForm = v.InferOutput<typeof RecuperarSenhaSchema>

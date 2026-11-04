import * as v from 'valibot'

import { avaliarSenha, isEmailAluno } from '@/utils/validacoes'

export const CadastroSchema = v.object({
  email: v.pipe(
    v.string(),
    v.trim(),
    v.nonEmpty('Digite o seu e-mail de aluno, por exemplo nome@aluno.ifce.edu.br.'),
    v.check(isEmailAluno, 'Use o e-mail de aluno, que termina em @aluno.ifce.edu.br.'),
  ),
  senha: v.pipe(
    v.string(),
    v.check(
      (senha) => avaliarSenha(senha).isValida,
      'A senha precisa de pelo menos 8 caracteres, com uma letra e um número.',
    ),
  ),
})

export type CadastroForm = v.InferOutput<typeof CadastroSchema>

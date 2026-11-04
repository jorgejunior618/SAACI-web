import * as v from 'valibot'

import { avaliarSenha } from '@/utils/validacoes'

export const RedefinirSenhaSchema = v.object({
  senha: v.pipe(
    v.string(),
    v.check(
      (senha) => avaliarSenha(senha).isValida,
      'A senha precisa de pelo menos 8 caracteres, com uma letra e um número.',
    ),
  ),
})

export type RedefinirSenhaForm = v.InferOutput<typeof RedefinirSenhaSchema>

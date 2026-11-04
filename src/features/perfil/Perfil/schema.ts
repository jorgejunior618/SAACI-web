import * as v from 'valibot'

import { isSemestre } from '@/utils/validacoes'

export const NomeSchema = v.object({
  valor: v.pipe(
    v.string(),
    v.trim(),
    v.nonEmpty('Digite o nome completo, como está nos seus documentos.'),
    v.check(
      (nome) => nome.split(/\s+/).length >= 2,
      'Digite nome e sobrenome, como nos seus documentos.',
    ),
  ),
})

// Pode ficar em branco: só vai no formulário.
export const MatriculaSchema = v.object({
  valor: v.pipe(
    v.string(),
    v.trim(),
    v.check(
      (m) => m === '' || /^\d{6,14}$/.test(m),
      'Digite só os números da matrícula, por exemplo 2023104501.',
    ),
  ),
})

export const SemestreSchema = v.object({
  valor: v.pipe(
    v.string(),
    v.trim(),
    v.check(isSemestre, 'Digite no formato ano.semestre, por exemplo 2023.2.'),
  ),
})

export type CampoForm = { valor: string }

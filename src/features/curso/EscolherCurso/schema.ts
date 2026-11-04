import * as v from 'valibot'

import { isSemestre } from '@/utils/validacoes'

export const SemestreSchema = v.object({
  ingresso: v.pipe(
    v.string(),
    v.trim(),
    v.nonEmpty('Digite o semestre em que você entrou, por exemplo 2023.2.'),
    v.check(isSemestre, 'Digite no formato ano.semestre, por exemplo 2023.2.'),
  ),
})

export type SemestreForm = v.InferOutput<typeof SemestreSchema>

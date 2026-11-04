import * as v from 'valibot'

import { parseData } from '@/utils/datas'
import { parseNumero } from '@/utils/numeros'

export const CorrigirAtividadeSchema = v.object({
  nome: v.pipe(
    v.string(),
    v.trim(),
    v.nonEmpty('Digite o nome da atividade, como está no certificado.'),
  ),
  quantidade: v.pipe(
    v.string(),
    v.check(
      (texto) => parseNumero(texto) !== null,
      'Digite um número, como está no certificado, por exemplo 40.',
    ),
  ),
  dataFim: v.pipe(
    v.string(),
    v.check(
      (texto) => parseData(texto) !== null,
      'Digite no formato dd/mm/aaaa, por exemplo 12/09/2026.',
    ),
  ),
})

export type CorrigirAtividadeForm = v.InferOutput<typeof CorrigirAtividadeSchema>

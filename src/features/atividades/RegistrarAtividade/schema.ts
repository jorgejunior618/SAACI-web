import * as v from 'valibot'

import { parseData } from '@/utils/datas'
import { parseNumero } from '@/utils/numeros'

export const RegistrarAtividadeSchema = v.object({
  nome: v.pipe(
    v.string(),
    v.trim(),
    v.nonEmpty('Digite o nome da atividade, como está no certificado.'),
  ),
  quantidade: v.pipe(
    v.string(),
    v.check(
      (texto) => parseNumero(texto) !== null,
      'Digite as horas que aparecem no certificado, por exemplo 40.',
    ),
  ),
  dataFim: v.pipe(
    v.string(),
    v.check(
      (texto) => parseData(texto) !== null,
      'Não conseguimos ler a data. Digite no formato dd/mm/aaaa, por exemplo 12/09/2026.',
    ),
  ),
})

export type RegistrarAtividadeForm = v.InferOutput<typeof RegistrarAtividadeSchema>

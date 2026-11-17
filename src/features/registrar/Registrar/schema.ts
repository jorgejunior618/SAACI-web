import * as v from 'valibot'

import { END_BEFORE_START_MESSAGE } from '@/services/activities'

import { parseBrDate, parseQuantity } from './utils'

const DATE_FORMAT_MESSAGE = 'Digite a data no formato dd/mm/aaaa, por exemplo 12/09/2026.'

function dateField(emptyMessage: string) {
  return v.pipe(
    v.string(),
    v.trim(),
    v.nonEmpty(emptyMessage),
    v.check((text) => parseBrDate(text) !== null, DATE_FORMAT_MESSAGE),
    // O `check` acima garante a data; o `?? ''` só existe para o tipo.
    v.transform((text) => parseBrDate(text) ?? ''),
  )
}

/**
 * Campos de texto do registro: nome, quantidade e as datas de início e fim em dd/mm/aaaa.
 *
 * @remarks
 * A saída já vem no formato do `NewActivity`: quantidade em número e datas ISO. Item e comprovante
 * ficam fora, porque vêm do `ItemPicker` e do `FileUpload`. Cada mensagem diz o que digitar. O fim
 * antes do início aparece no campo do fim.
 */
export const ActivityFormSchema = v.pipe(
  v.object({
    name: v.pipe(
      v.string(),
      v.trim(),
      v.nonEmpty('Digite o nome da atividade, como está no certificado.'),
    ),
    quantity: v.pipe(
      v.string(),
      v.trim(),
      v.nonEmpty('Digite a quantidade que aparece no certificado, por exemplo 40.'),
      v.check((text) => parseQuantity(text) !== null, 'Digite só o número, por exemplo 40 ou 2,5.'),
      v.transform((text) => parseQuantity(text) ?? 0),
      v.minValue(0.1, 'Digite um número maior que zero, por exemplo 40.'),
    ),
    startDate: dateField('Digite a data em que a atividade começou, no formato dd/mm/aaaa.'),
    endDate: dateField('Digite a data em que a atividade terminou, no formato dd/mm/aaaa.'),
  }),
  v.forward(
    v.partialCheck(
      [['startDate'], ['endDate']],
      ({ startDate, endDate }) => endDate >= startDate,
      END_BEFORE_START_MESSAGE,
    ),
    ['endDate'],
  ),
)

/** Campos do registro como a pessoa digita. */
export type ActivityFormInput = v.InferInput<typeof ActivityFormSchema>
/** Campos do registro depois da validação, prontos para o `createActivity`. */
export type ActivityFormOutput = v.InferOutput<typeof ActivityFormSchema>

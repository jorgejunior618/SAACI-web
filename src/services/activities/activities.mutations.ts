import type { QueryClient } from '@tanstack/react-query'
import * as v from 'valibot'

import { simulateLatency } from '@/utils/simulate-latency'

import { progressKeys } from '../progress/progress.keys'
import { activitiesKeys } from './activities.keys'
import { deleteActivity, insertActivity, patchActivity } from './activities.mock'
import { ActivityCorrectionSchema, ActivitySchema, NewActivitySchema } from './activities.types'
import type { Activity, ActivityCorrection, NewActivity } from './activities.types'

/**
 * Registra uma atividade com o comprovante, completa ou nada (RNF24).
 *
 * @remarks
 * Alvo: o arquivo sobe antes e uma RPC grava atividade e referência numa transação só. Se falhar,
 * o que o aluno preencheu continua na tela. Chame `invalidateAfterActivityWrite` no `onSuccess`.
 *
 * @param nova Dados da atividade e o arquivo. Aceita PDF, JPG ou PNG, até 10 MB.
 * @returns A atividade gravada, já com `countedHours` e `situacao`.
 */
export async function createActivity(input: NewActivity): Promise<Activity> {
  await simulateLatency()

  return v.parse(ActivitySchema, insertActivity(v.parse(NewActivitySchema, input)))
}

/**
 * Corrige nome, item, quantidade ou data de uma atividade. O comprovante não se troca.
 *
 * @remarks
 * As horas contadas são recalculadas pelo cálculo único. Chame `invalidateAfterActivityWrite`.
 *
 * @param id Identificador da atividade.
 * @param atualizadaEm O `updatedAt` que a tela leu. Se a atividade mudou desde então, a escrita é
 * recusada em vez de sobrescrever.
 * @param changes Campos a corrigir. Só os enviados mudam.
 * @returns A atividade depois da correção.
 * @throws {ActivityNotFoundError} A atividade não existe.
 * @throws {StaleActivityError} `updatedAt` não bate com o atual.
 */
export async function updateActivity(
  id: string,
  updatedAt: string,
  changes: ActivityCorrection,
): Promise<Activity> {
  await simulateLatency()

  return v.parse(
    ActivitySchema,
    patchActivity(id, updatedAt, v.parse(ActivityCorrectionSchema, changes)),
  )
}

/**
 * Remove a atividade e apaga o comprovante. Não dá para desfazer.
 *
 * @remarks
 * Chame `invalidateAfterActivityRemoval` no `onSuccess`, nunca `invalidateAfterActivityWrite`: a
 * segunda derruba o detalhe em que a tela está montada, e o `notFound()` dispara antes da volta à lista.
 *
 * @param id Identificador da atividade.
 * @throws {ActivityNotFoundError} A atividade não existe.
 */
export async function removeActivity(id: string): Promise<void> {
  await simulateLatency()
  deleteActivity(id)
}

/** Derruba o que registrar ou corrigir uma atividade torna falso: atividades e progresso (RNF20). */
export function invalidateAfterActivityWrite(queryClient: QueryClient): void {
  void queryClient.invalidateQueries({ queryKey: activitiesKeys.all })
  void queryClient.invalidateQueries({ queryKey: progressKeys.all })
}

/** Derruba a lista e o progresso, sem tocar no detalhe da atividade removida. */
export function invalidateAfterActivityRemoval(queryClient: QueryClient): void {
  void queryClient.invalidateQueries({ queryKey: activitiesKeys.lists() })
  void queryClient.invalidateQueries({ queryKey: progressKeys.all })
}

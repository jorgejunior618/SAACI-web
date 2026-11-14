import type { QueryClient } from '@tanstack/react-query'
import * as v from 'valibot'

import { simulateLatency } from '@/utils/simulate-latency'

import { progressKeys } from '../progress/progress.keys'
import { readActivitiesWithHours } from './activities.api'
import { ActivityNotFoundError } from './activities.errors'
import { activitiesKeys } from './activities.keys'
import { deleteActivity, insertActivity, patchActivity } from './activities.mock'
import { ActivityCorrectionSchema, NewActivitySchema } from './activities.types'
import type { Activity, ActivityCorrection, NewActivity } from './activities.types'

// Devolve a atividade gravada já com as horas, calculadas sobre a lista inteira.
async function withHours(id: string): Promise<Activity> {
  const activity = (await readActivitiesWithHours()).find((item) => item.id === id)

  if (!activity) throw new ActivityNotFoundError()
  return activity
}

/**
 * Registra uma atividade com o comprovante, completa ou nada.
 *
 * @remarks
 * Alvo: o arquivo sobe antes e uma RPC grava atividade e referência numa transação só. Se falhar,
 * o que o aluno preencheu continua na tela. Chame `invalidateAfterActivityWrite` no `onSuccess`.
 *
 * @param input Dados da atividade e o arquivo. Aceita PDF, JPG ou PNG, até 10 MB. A data de fim
 * não pode vir antes da de início.
 * @returns A atividade gravada, já com `countedHours`, `status` e `reason` do cálculo único.
 */
export async function createActivity(input: NewActivity): Promise<Activity> {
  await simulateLatency()
  const stored = insertActivity(v.parse(NewActivitySchema, input))

  return withHours(stored.id)
}

/**
 * Corrige nome, item, quantidade ou data de uma atividade. O comprovante não se troca.
 *
 * @remarks
 * As horas contadas são recalculadas pelo cálculo único. Chame `invalidateAfterActivityWrite`.
 *
 * @param id Identificador da atividade.
 * @param updatedAt O `updatedAt` que a tela leu. Se a atividade mudou desde então, a escrita é
 * recusada em vez de sobrescrever.
 * @param changes Campos a corrigir. Só os enviados mudam.
 * @returns A atividade depois da correção.
 * @throws {ActivityNotFoundError} A atividade não existe.
 * @throws {StaleActivityError} `updatedAt` não bate com o atual.
 * @throws {InvalidActivityDatesError} A correção deixaria o fim antes do início.
 */
export async function updateActivity(
  id: string,
  updatedAt: string,
  changes: ActivityCorrection,
): Promise<Activity> {
  await simulateLatency()
  patchActivity(id, updatedAt, v.parse(ActivityCorrectionSchema, changes))

  return withHours(id)
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

/** Derruba o que registrar ou corrigir uma atividade torna falso: atividades e progresso. */
export function invalidateAfterActivityWrite(queryClient: QueryClient): void {
  void queryClient.invalidateQueries({ queryKey: activitiesKeys.all })
  void queryClient.invalidateQueries({ queryKey: progressKeys.all })
}

/** Derruba a lista e o progresso, sem tocar no detalhe da atividade removida. */
export function invalidateAfterActivityRemoval(queryClient: QueryClient): void {
  void queryClient.invalidateQueries({ queryKey: activitiesKeys.lists() })
  void queryClient.invalidateQueries({ queryKey: progressKeys.all })
}

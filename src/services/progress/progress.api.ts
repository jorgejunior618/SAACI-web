import * as v from 'valibot'

import { simulateLatency } from '@/utils/simulate-latency'

import { readProgress } from './progress.mock'
import { ProgressSchema } from './progress.types'
import type { Progress } from './progress.types'

/**
 * Lê o progresso do aluno: total, meta, quanto falta e as horas de cada item.
 *
 * @remarks
 * Hoje devolve um valor fixo (59h de 120h). Quem registra ou remove atividade já deve invalidar
 * esta query com `invalidateAfterActivityWrite`, para a tela funcionar igual quando o cálculo real
 * entrar.
 *
 * @returns O progresso atual.
 */
export async function getProgress(): Promise<Progress> {
  await simulateLatency()

  return v.parse(ProgressSchema, readProgress())
}

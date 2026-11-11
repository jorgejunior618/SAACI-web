import * as v from 'valibot'

import { computeProgress } from '@/utils/compute-hours'
import { simulateLatency } from '@/utils/simulate-latency'

import { readActivitiesWithHours } from '../activities/activities.api'
import { getProfile } from '../profile/profile.api'
import { getCourse, getRuleItems } from '../rules/rules.api'
import { ProgressSchema } from './progress.types'
import type { Progress } from './progress.types'

/**
 * Lê o progresso do aluno: total, meta, quanto falta e as horas de cada item.
 *
 * @remarks
 * Sai do cálculo único, o mesmo que dá as horas de cada atividade. No mock, compõe
 * atividades, regras, curso e perfil. No Supabase, vira uma RPC. Quem registra, corrige ou remove
 * atividade, ou muda o semestre do perfil, invalida esta query.
 *
 * @returns O progresso atual.
 * @throws {Error} O perfil ainda não tem curso. O gate de Seu curso impede chegar aqui.
 */
export async function getProgress(): Promise<Progress> {
  await simulateLatency()
  const profile = await getProfile()

  if (!profile.courseId)
    throw new Error('O perfil ainda não tem curso. Escolha o curso em Seu curso.')

  const [course, ruleItems, activities] = await Promise.all([
    getCourse(profile.courseId),
    getRuleItems(profile.courseId),
    readActivitiesWithHours(),
  ])

  if (!course) throw new Error(`O curso ${profile.courseId} do perfil não existe nas regras.`)

  return v.parse(
    ProgressSchema,
    computeProgress({
      activities,
      ruleItems,
      startSemester: profile.startSemester,
      targetHours: course.targetHours,
    }),
  )
}

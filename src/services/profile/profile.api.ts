import * as v from 'valibot'

import { simulateLatency } from '@/utils/simulate-latency'

import { readProfile } from './profile.mock'
import { ProfileSchema } from './profile.types'
import type { Profile } from './profile.types'

/**
 * Lê o perfil do aluno logado.
 *
 * @returns Nome, matrícula, semestre de início e curso. Curso e semestre vêm `null` até o aluno
 * passar por Seu curso.
 */
export async function getProfile(): Promise<Profile> {
  await simulateLatency()

  return v.parse(ProfileSchema, readProfile())
}

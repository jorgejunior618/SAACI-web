import type { QueryClient } from '@tanstack/react-query'
import * as v from 'valibot'

import { simulateLatency } from '@/utils/simulate-latency'

import { activitiesKeys } from '../activities/activities.keys'
import { progressKeys } from '../progress/progress.keys'
import { profileKeys } from './profile.keys'
import { writeProfile } from './profile.mock'
import { ProfileSchema, UpdateProfileSchema } from './profile.types'
import type { Profile, UpdateProfile } from './profile.types'

/**
 * Salva só os campos enviados do perfil. Serve ao Perfil e ao Seu curso (curso e semestre).
 *
 * @remarks
 * Mudar o semestre de início muda o total de horas, então chame
 * `invalidateAfterProfileWrite` depois. A tela avisa o aluno antes de salvar.
 *
 * @param changes Campos a mudar. `startSemester` aceita só dia 1 de janeiro ou de julho.
 * @returns O perfil inteiro depois da mudança.
 * @throws {CourseLockedError} Trocou um curso já escolhido e há atividades registradas.
 */
export async function updateProfile(changes: UpdateProfile): Promise<Profile> {
  await simulateLatency()

  return v.parse(ProfileSchema, writeProfile(v.parse(UpdateProfileSchema, changes)))
}

/**
 * Derruba o que uma escrita no perfil torna falso: o perfil, o progresso e as atividades.
 *
 * @remarks
 * O semestre de início decide se cada atividade conta, então o status e as horas de
 * cada uma mudam junto com o total.
 *
 * @param queryClient O cliente do TanStack Query da tela, de `useQueryClient()`.
 */
export function invalidateAfterProfileWrite(queryClient: QueryClient): void {
  void queryClient.invalidateQueries({ queryKey: profileKeys.all })
  void queryClient.invalidateQueries({ queryKey: progressKeys.all })
  void queryClient.invalidateQueries({ queryKey: activitiesKeys.all })
}

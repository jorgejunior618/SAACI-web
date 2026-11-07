import type { QueryClient } from '@tanstack/react-query'
import * as v from 'valibot'

import { simulateLatency } from '@/utils/simulate-latency'

import { progressKeys } from '../progress/progress.keys'
import { profileKeys } from './profile.keys'
import { writeProfile } from './profile.mock'
import { ProfileSchema, UpdateProfileSchema } from './profile.types'
import type { Profile, UpdateProfile } from './profile.types'

/**
 * Salva só os campos enviados do perfil. Serve ao Perfil e ao Seu curso (curso e semestre).
 *
 * @remarks
 * Mudar o semestre de início muda o total de horas (RF38), então chame
 * `invalidateAfterProfileWrite` depois. A tela avisa o aluno antes de salvar (RF11).
 *
 * @param changes Campos a mudar. `startSemester` aceita só dia 1 de janeiro ou de julho.
 * @returns O perfil inteiro depois da mudança.
 * @throws {CourseLockedError} Trocou um curso já escolhido e há atividades registradas (RF10).
 */
export async function updateProfile(changes: UpdateProfile): Promise<Profile> {
  await simulateLatency()

  return v.parse(ProfileSchema, writeProfile(v.parse(UpdateProfileSchema, changes)))
}

/** Derruba o que uma escrita no perfil torna falso: o próprio perfil e o progresso (RF11, RF38). */
export function invalidateAfterProfileWrite(queryClient: QueryClient): void {
  void queryClient.invalidateQueries({ queryKey: profileKeys.all })
  void queryClient.invalidateQueries({ queryKey: progressKeys.all })
}

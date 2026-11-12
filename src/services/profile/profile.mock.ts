import { CourseLockedError } from './profile.errors'
import type { Profile, UpdateProfile } from './profile.types'

// Conta recém-criada: curso e semestre nascem nulos e o aluno os escolhe em Seu curso (RF09, RF11).
// TODO: mock. Sai com a migração para o Supabase, onde a linha nasce com esses campos nulos.
const SEED: Profile = {
  name: 'Ana Beatriz Moura',
  enrollmentId: '2023104501',
  startSemester: null,
  courseId: null,
}

let profile: Profile = structuredClone(SEED)

// Representa a regra do banco (RF10), que o mock de `profile` não enxerga: o mock de `activities` é
// outro domínio. Os 9 vêm do exemplo do protótipo.
let registeredActivities = 9

/**
 * Volta o mock ao perfil de exemplo, sem curso nem semestre e com 9 atividades lançadas. Testes
 * chamam no `beforeEach`.
 */
export function resetProfileMock(): void {
  profile = structuredClone(SEED)
  registeredActivities = 9
}

/** Só para teste e demonstração: muda quantas atividades o aluno tem, para exercitar o RF10. */
export function setRegisteredActivitiesMock(total: number): void {
  registeredActivities = total
}

/** Perfil do aluno logado. */
export function readProfile(): Profile {
  return structuredClone(profile)
}

/** Aplica as mudanças. Trocar um curso já escolhido, com atividades lançadas, é recusado (RF10). */
export function writeProfile(changes: UpdateProfile): Profile {
  const isCourseChange =
    changes.courseId !== undefined &&
    profile.courseId !== null &&
    changes.courseId !== profile.courseId

  if (isCourseChange && registeredActivities > 0) throw new CourseLockedError()
  profile = { ...profile, ...changes }
  return structuredClone(profile)
}

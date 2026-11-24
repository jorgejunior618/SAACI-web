// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import { createClient } from '@supabase/client'
import type { DbClient } from '@supabase/client'
import type { TablesUpdate } from '@supabase/database.types'
import type { QueryClient } from '@tanstack/react-query'
import * as v from 'valibot'

import { readCurrentUser } from '../account/account.api'
import { activitiesKeys } from '../activities/activities.keys'
import { progressKeys } from '../progress/progress.keys'
import { getProfile, PROFILE_COLUMNS, toProfile } from './profile.api'
import { toProfileError } from './profile.errors'
import { profileKeys } from './profile.keys'
import { UpdateProfileSchema } from './profile.types'
import type { Profile, UpdateProfile } from './profile.types'

// Só os campos enviados viram coluna. `undefined` fica de fora, e `null` é um valor (apaga a matrícula).
function toRow(changes: UpdateProfile): TablesUpdate<'perfis'> {
  const row: TablesUpdate<'perfis'> = {}

  if (changes.name !== undefined) row.nome = changes.name
  if (changes.enrollmentId !== undefined) row.matricula = changes.enrollmentId
  if (changes.startSemester !== undefined) row.semestre_inicio = changes.startSemester
  if (changes.courseId !== undefined) row.curso_id = changes.courseId
  return row
}

/**
 * Salva só os campos enviados do perfil. Serve ao Perfil e ao Seu curso (curso e semestre).
 *
 * @remarks
 * Mudar o semestre de início muda o total de horas, então chame
 * `invalidateAfterProfileWrite` depois. A tela avisa o aluno antes de salvar. O `update` não confere
 * `updated_at`: o aluno é o único escritor e o patch é por campo (ADR 0009). A troca de curso com
 * atividades é recusada pelo banco, e o erro chega traduzido.
 *
 * @param changes Campos a mudar. `startSemester` aceita só dia 1 de janeiro ou de julho.
 * @param db Cliente do Supabase. No servidor, passe o de `@supabase/server`.
 * @returns O perfil inteiro depois da mudança.
 * @throws {CourseLockedError} Trocou um curso já escolhido e há atividades registradas.
 * @throws Error quando não há sessão, ou quando o banco recusa por outro motivo.
 */
export async function updateProfile(
  changes: UpdateProfile,
  db: DbClient = createClient(),
): Promise<Profile> {
  const row = toRow(v.parse(UpdateProfileSchema, changes))

  // Sem campo a gravar, o `update` do Supabase falharia. Devolver o perfil atual mantém o contrato.
  if (Object.keys(row).length === 0) return getProfile(db)

  const user = await readCurrentUser(db)

  if (!user) throw new Error('Sua sessão acabou. Entre de novo para salvar.')

  const { data, error } = await db
    .from('perfis')
    .update(row)
    .eq('aluno_id', user.id)
    .select(PROFILE_COLUMNS)
    .maybeSingle()

  if (error) throw toProfileError(error)
  if (!data) throw new Error('Não encontramos o seu perfil. Entre de novo para continuar.')
  return toProfile(data)
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

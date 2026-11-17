import { createClient } from '@supabase/client'
import type { DbClient } from '@supabase/client'
import type { Tables } from '@supabase/database.types'
import * as v from 'valibot'

import { ProfileSchema } from './profile.types'
import type { Profile } from './profile.types'

/** Colunas do `select` do perfil. Listadas porque `select('*')` não é permitido (`camada-servicos.md`). */
export const PROFILE_COLUMNS = 'nome, matricula, semestre_inicio, curso_id'

/** Só as colunas que o `select` pede, tiradas dos tipos gerados do banco. */
type ProfileRow = Pick<Tables<'perfis'>, 'nome' | 'matricula' | 'semestre_inicio' | 'curso_id'>

/**
 * Traduz a row de `perfis` para o tipo de domínio.
 *
 * @param row Row devolvida pelo banco, em `snake_case`.
 * @returns O perfil, já conferido pelo schema. Semestre fora de 1º de janeiro ou de julho é recusado.
 */
export function toProfile(row: ProfileRow): Profile {
  return v.parse(ProfileSchema, {
    name: row.nome,
    enrollmentId: row.matricula,
    startSemester: row.semestre_inicio,
    courseId: row.curso_id,
  })
}

/**
 * Lê o perfil do aluno logado.
 *
 * @remarks
 * A RLS devolve só a linha do dono, então a busca não leva filtro. Com sessão a linha sempre
 * existe, porque um gatilho a cria no cadastro (ADR 0009). Sem sessão não há linha e a função lança.
 *
 * @param db Cliente do Supabase. No servidor, passe o de `@supabase/server`.
 * @returns Nome, matrícula, semestre de início e curso. Curso e semestre vêm `null` até o aluno
 * passar por Seu curso.
 * @throws Error quando não há perfil visível, que é o caso de quem não está logado.
 */
export async function getProfile(db: DbClient = createClient()): Promise<Profile> {
  const { data, error } = await db.from('perfis').select(PROFILE_COLUMNS).maybeSingle()

  if (error) throw error
  if (!data) {
    throw new Error('Não encontramos o seu perfil. Entre de novo para continuar.')
  }
  return toProfile(data)
}

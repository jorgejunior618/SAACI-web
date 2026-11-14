import { createClient } from '@supabase/client'
import type { DbClient } from '@supabase/client'
import type { Tables } from '@supabase/database.types'
import * as v from 'valibot'

import { CourseSchema, RuleItemSchema } from './rules.types'
import type { Course, RuleItem } from './rules.types'

const COURSE_COLUMNS = 'id, nome, grau, campus, carga_total_horas'
const ITEM_COLUMNS = 'numero, nome, regra, horas, a_cada, unidade, maximo_horas'

const UuidSchema = v.pipe(v.string(), v.uuid())

// Id que não é uuid nunca existe no banco, e o Postgres responderia com erro de tipo (22P02) em vez
// de "nada encontrado". Responder antes da query mantém o contrato: curso desconhecido é `null`.
function isUuid(id: string): boolean {
  return v.is(UuidSchema, id)
}

// Mesma normalização de `public.sem_acento`: sem acento, minúsculas, sem espaço nas pontas.
function normalizeSearch(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()
}

// `%`, `_` e `\` têm sentido próprio no `ilike`. O aluno digita texto, não padrão.
function escapeLike(text: string): string {
  return text.replace(/[\\%_]/g, '\\$&')
}

// Só as colunas que o `select` pede, tiradas dos tipos gerados do banco.
type CourseRow = Pick<Tables<'cursos'>, 'id' | 'nome' | 'grau' | 'campus' | 'carga_total_horas'>
type ItemRow = Pick<
  Tables<'itens_curso'>,
  'numero' | 'nome' | 'regra' | 'horas' | 'a_cada' | 'unidade' | 'maximo_horas'
>

function toCourse(row: CourseRow): Course {
  return v.parse(CourseSchema, {
    id: row.id,
    name: row.nome,
    degree: row.grau,
    campus: row.campus,
    targetHours: row.carga_total_horas,
  })
}

function toRuleItem(row: ItemRow): RuleItem {
  return v.parse(RuleItemSchema, {
    itemNumber: row.numero,
    name: row.nome,
    rule: row.regra,
    ratio: { hours: row.horas, per: row.a_cada, unit: row.unidade },
    maxHours: row.maximo_horas,
  })
}

/**
 * Lista os cursos que já têm regras cadastradas, filtrados pelo nome.
 *
 * @param search Parte do nome do curso. Ignora acento e caixa. Sem texto, devolve todos.
 * @param db Cliente do Supabase. No servidor, passe o de `@supabase/server`.
 * @returns Cursos em ordem alfabética. Lista vazia quando nenhum curso combina.
 */
export async function getCourses(search = '', db: DbClient = createClient()): Promise<Course[]> {
  const term = normalizeSearch(search)
  const query = db.from('cursos').select(COURSE_COLUMNS)
  const { data, error } = await (
    term ? query.ilike('nome_busca', `%${escapeLike(term)}%`) : query
  ).order('nome')

  if (error) throw error
  return data.map(toCourse)
}

/**
 * Busca um curso pelo id.
 *
 * @param id Identificador do curso, o mesmo que o perfil guarda em `courseId`.
 * @param db Cliente do Supabase. No servidor, passe o de `@supabase/server`.
 * @returns O curso, ou `null` quando não existe.
 */
export async function getCourse(id: string, db: DbClient = createClient()): Promise<Course | null> {
  if (!isUuid(id)) return null

  const { data, error } = await db.from('cursos').select(COURSE_COLUMNS).eq('id', id).maybeSingle()

  if (error) throw error
  return data ? toCourse(data) : null
}

/**
 * Lista os itens do formulário de um curso, com a regra de contagem, a razão de conversão e o
 * máximo de cada um.
 *
 * @param courseId Identificador do curso.
 * @param db Cliente do Supabase. No servidor, passe o de `@supabase/server`.
 * @returns Itens na ordem do formulário. Lista vazia para curso sem regras.
 */
export async function getRuleItems(
  courseId: string,
  db: DbClient = createClient(),
): Promise<RuleItem[]> {
  if (!isUuid(courseId)) return []

  const { data, error } = await db
    .from('itens_curso')
    .select(ITEM_COLUMNS)
    .eq('curso_id', courseId)
    .order('numero')

  if (error) throw error
  return data.map(toRuleItem)
}

import * as v from 'valibot'

import { simulateLatency } from '@/utils/simulate-latency'

import { findCourse, listCourses, listRuleItems } from './rules.mock'
import { CourseSchema, RuleItemSchema } from './rules.types'
import type { Course, RuleItem } from './rules.types'

/**
 * Lista os cursos que já têm regras cadastradas, filtrados pelo nome.
 *
 * @param busca Parte do nome do curso. Ignora acento e caixa. Sem texto, devolve todos.
 * @returns Cursos em ordem alfabética. Lista vazia quando nenhum curso combina.
 */
export async function getCourses(search?: string): Promise<Course[]> {
  await simulateLatency()

  return v.parse(v.array(CourseSchema), listCourses(search))
}

/**
 * Busca um curso pelo id.
 *
 * @param id Identificador do curso, o mesmo que o perfil guarda em `courseId`.
 * @returns O curso, ou `null` quando não existe.
 */
export async function getCourse(id: string): Promise<Course | null> {
  await simulateLatency()
  const course = findCourse(id)

  return course ? v.parse(CourseSchema, course) : null
}

/**
 * Lista os itens do formulário de um curso, com a regra de contagem e o máximo de cada um.
 *
 * @param cursoId Identificador do curso.
 * @returns Itens na ordem do formulário. Lista vazia para curso sem regras.
 */
export async function getRuleItems(courseId: string): Promise<RuleItem[]> {
  await simulateLatency()

  return v.parse(v.array(RuleItemSchema), listRuleItems(courseId))
}

import type { ReactNode } from 'react'

import { CourseOption } from '@/components/CourseOption'
import type { Course } from '@/services/rules'

import * as S from './styles'

export type CourseListProps = {
  /** Cursos a listar, na ordem em que chegam. */
  courses: Course[]
  /** Chamada ao tocar num curso, com o id dele. */
  onSelect: (courseId: string) => void
}

/**
 * Lista de cursos da busca, uma linha tocável por curso.
 *
 * @remarks
 * Aparece em dois lugares da busca: com o resultado do que a pessoa digitou e, quando nada combina,
 * com todos os cursos que já têm regras.
 *
 * @example
 * ```tsx
 * <CourseList courses={results} onSelect={setSelectedCourseId} />
 * ```
 */
export function CourseList({ courses, onSelect }: CourseListProps): ReactNode {
  return (
    <S.List>
      {courses.map((course) => (
        <S.Item key={course.id}>
          <CourseOption course={course} onSelect={onSelect} />
        </S.Item>
      ))}
    </S.List>
  )
}

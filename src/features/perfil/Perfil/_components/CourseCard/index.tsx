import { ChevronRight } from 'lucide-react'
import NextLink from 'next/link'
import type { ReactNode } from 'react'

import { Card, Icon, Link } from '@design-system'

import type { Course } from '@/services/rules'
import { formatHours } from '@/utils/format-hours'

import * as S from './styles'

export type CourseCardProps = {
  /** Curso do aluno, com o grau e a meta de horas. */
  course: Course
}

/**
 * Cartão do curso no Perfil: nome, grau, meta de horas e o caminho para Trocar curso.
 *
 * @remarks
 * Só mostra a meta que veio do curso, sem calcular nada (RNF20). Quem decide se a troca é possível é
 * a tela de Trocar curso.
 *
 * @example
 * ```tsx
 * <CourseCard course={course} />
 * ```
 */
export function CourseCard({ course }: CourseCardProps): ReactNode {
  return (
    <Card>
      <S.Root>
        <S.Text>
          <S.Name>{course.name}</S.Name>
          <S.Detail>
            {course.degree} · meta de {formatHours(course.targetHours, { fractionDigits: 0 })}
          </S.Detail>
        </S.Text>
        <S.Action>
          <Link as={NextLink} href="/perfil/curso" isStandalone>
            Trocar
          </Link>
          <Icon icon={ChevronRight} size="sm" />
        </S.Action>
      </S.Root>
    </Card>
  )
}

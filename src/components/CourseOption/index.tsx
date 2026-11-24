// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import { ChevronRight, GraduationCap } from 'lucide-react'
import type { ReactNode } from 'react'

import { Card, Icon } from '@design-system'

import type { Course } from '@/services/rules'

import * as S from './styles'

export type CourseOptionProps = {
  /** Curso que a linha mostra: nome, grau e campus. */
  course: Course
  /** Chamada ao tocar na linha, com o id do curso. */
  onSelect: (courseId: string) => void
}

/**
 * Linha de curso da busca: ícone, nome, "grau · campus" e a seta. O cartão inteiro é um botão.
 *
 * @remarks
 * Fica local em Seu curso: o desenho vem do protótipo e nenhuma outra tela o usa. Se uma segunda
 * tela precisar, ele sobe para o design system (`doc/design-system.md`, "Promoção").
 *
 * @example
 * ```tsx
 * <CourseOption course={course} onSelect={setSelectedCourseId} />
 * ```
 */
export function CourseOption({ course, onSelect }: CourseOptionProps): ReactNode {
  return (
    <Card as="button" type="button" className={S.card} onClick={() => onSelect(course.id)}>
      <S.Icon>
        <Icon icon={GraduationCap} />
      </S.Icon>
      <S.Text>
        <S.Name>{course.name}</S.Name>
        <S.Meta>
          {course.degree} · campus {course.campus}
        </S.Meta>
      </S.Text>
      <S.Chevron>
        <Icon icon={ChevronRight} size="sm" />
      </S.Chevron>
    </Card>
  )
}

'use client'

import { useSuspenseQuery } from '@tanstack/react-query'
import { GraduationCap } from 'lucide-react'
import { useState } from 'react'
import type { ReactNode } from 'react'

import { AppFrame, Button, StateScreen, TopBar } from '@design-system'

import { rulesQueries } from '@/services/rules'

import { AccountLinks } from './_components/AccountLinks'
import { CourseSearch } from './_components/CourseSearch'
import { Empty } from './Empty'
import * as S from './styles'

/**
 * Tela Seu curso, do primeiro acesso: a pessoa escolhe o curso e, no passo seguinte, o semestre em
 * que entrou.
 *
 * @remarks
 * Guarda só o id do curso escolhido. Sem escolha, mostra a busca. Com escolha, mostra a confirmação
 * com a meta de horas. Quem leva a pessoa ao painel depois de salvar é o `SessionGate` do grupo
 * `(onboarding)`, que percebe o curso no perfil. A página envolve este componente em `Suspense`,
 * com `Loading` como fallback.
 *
 * @example
 * ```tsx
 * <Suspense fallback={<Loading />}>
 *   <SeuCurso />
 * </Suspense>
 * ```
 */
export function SeuCurso(): ReactNode {
  const { data: courses } = useSuspenseQuery(rulesQueries.courses())
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null)

  if (courses.length === 0) return <Empty />

  const selectedCourse = courses.find((course) => course.id === selectedCourseId)

  return (
    <AppFrame topBar={<TopBar variant="home" />}>
      <S.Page>
        {selectedCourse ? (
          // TODO: provisório. Trocar pelo CourseConfirm (meta de horas e semestre) na etapa 3.
          <StateScreen
            variant="empty"
            icon={GraduationCap}
            eyebrow="Em construção"
            title={selectedCourse.name}
            description="A confirmação do curso ainda não foi montada."
            actions={
              <Button variant="secondary" block onClick={() => setSelectedCourseId(null)}>
                Escolher outro
              </Button>
            }
          />
        ) : (
          <CourseSearch courses={courses} onSelect={setSelectedCourseId} />
        )}
        <AccountLinks />
      </S.Page>
    </AppFrame>
  )
}

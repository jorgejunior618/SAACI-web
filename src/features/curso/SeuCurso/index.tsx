'use client'

import { useSuspenseQuery } from '@tanstack/react-query'
import { Suspense, useState } from 'react'
import type { ReactNode } from 'react'

import { AppFrame, LoadingState, TopBar } from '@design-system'

import { CourseConfirm } from '@/components/CourseConfirm'
import { CourseSearch } from '@/components/CourseSearch'
import { rulesQueries } from '@/services/rules'

import { AccountLinks } from './_components/AccountLinks'
import { Empty } from './Empty'
import * as S from './styles'

/**
 * Tela Seu curso, do primeiro acesso: a pessoa escolhe o curso e, no passo seguinte, confirma a meta
 * de horas e informa o semestre em que entrou.
 *
 * @remarks
 * Guarda só o id do curso escolhido. Sem escolha, mostra a busca. Com escolha, mostra a confirmação,
 * e "Escolher outro" volta à busca. Quem leva a pessoa ao painel depois de salvar é o `SessionGate`
 * do grupo `(onboarding)`, que percebe o curso no perfil. A página envolve este componente em
 * `Suspense`, com `Loading` como fallback. A confirmação tem um `Suspense` próprio, porque os itens
 * do curso chegam depois da lista.
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
      {selectedCourse ? (
        <Suspense fallback={<LoadingState label="Buscando as regras do curso" />}>
          <CourseConfirm
            course={selectedCourse}
            onChooseOther={() => setSelectedCourseId(null)}
            footerLinks={<AccountLinks />}
          />
        </Suspense>
      ) : (
        <S.Page>
          <CourseSearch courses={courses} onSelect={setSelectedCourseId} />
          <AccountLinks />
        </S.Page>
      )}
    </AppFrame>
  )
}

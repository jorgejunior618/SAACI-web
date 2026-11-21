'use client'

import { useSuspenseQuery } from '@tanstack/react-query'
import NextLink from 'next/link'
import { useRouter } from 'next/navigation'
import { Suspense, useState } from 'react'
import type { ReactNode } from 'react'

import { AppFrame, LoadingState, TopBar } from '@design-system'

import { CourseConfirm } from '@/components/CourseConfirm'
import { CourseSearch } from '@/components/CourseSearch'
import { MainNav } from '@/components/MainNav'
import { rulesQueries } from '@/services/rules'
import { formatSemester } from '@/utils/start-semester'

import * as S from './styles'

/** Props de {@link CourseChange}. */
export type CourseChangeProps = {
  /** Semestre de início do perfil (`2023-07-01`), que já vem preenchido. `null` deixa o campo vazio. */
  startSemester: string | null
}

/**
 * Troca de curso para quem não tem nenhuma atividade registrada (RF10).
 *
 * @remarks
 * Dois passos, os mesmos do primeiro acesso: busca do curso e confirmação com o semestre. O semestre
 * do perfil já vem preenchido, porque quem troca costuma manter a data de entrada. Ao salvar, volta
 * ao Perfil. A barra de baixo só aparece na busca: na confirmação o botão de salvar ocupa o rodapé.
 * Se uma atividade for criada em outra aba, o banco recusa e a confirmação avisa (`CourseLockedError`).
 * Precisa de `Suspense` acima, porque lê a lista de cursos com `useSuspenseQuery`.
 *
 * @example
 * ```tsx
 * if (activities.length === 0) return <CourseChange startSemester={profile.startSemester} />
 * ```
 */
export function CourseChange({ startSemester }: CourseChangeProps): ReactNode {
  const router = useRouter()
  const { data: courses } = useSuspenseQuery(rulesQueries.courses())
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null)

  const selectedCourse = courses.find((course) => course.id === selectedCourseId)

  return (
    <AppFrame
      topBar={<TopBar variant="inner" title="Trocar curso" backHref="/perfil" linkAs={NextLink} />}
      bottomNav={selectedCourse ? undefined : <MainNav />}
    >
      {selectedCourse ? (
        <Suspense fallback={<LoadingState label="Buscando as regras do curso" />}>
          <CourseConfirm
            course={selectedCourse}
            onChooseOther={() => setSelectedCourseId(null)}
            submitLabel="Trocar curso"
            defaultStartSemester={startSemester ? formatSemester(startSemester) : undefined}
            onSaved={() => router.replace('/perfil')}
          />
        </Suspense>
      ) : (
        <S.Page>
          <CourseSearch courses={courses} onSelect={setSelectedCourseId} />
        </S.Page>
      )}
    </AppFrame>
  )
}

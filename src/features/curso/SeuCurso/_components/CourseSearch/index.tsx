'use client'

import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { Search } from 'lucide-react'
import { useDeferredValue, useState } from 'react'
import type { ReactNode } from 'react'

import { Link, Notice, TextField } from '@design-system'

import { rulesQueries } from '@/services/rules'
import type { Course } from '@/services/rules'

import { CourseList } from './_components/CourseList'
import * as S from './styles'

export type CourseSearchProps = {
  /** Todos os cursos que já têm regras. Aparecem quando a busca não acha nada. */
  courses: Course[]
  /** Chamada ao tocar num curso, com o id dele. */
  onSelect: (courseId: string) => void
}

/**
 * Passo "Qual é o seu curso?": campo de busca e a lista de cursos que já têm regras no SAACI.
 *
 * @remarks
 * Busca no nome, sem diferenciar acento nem maiúscula (quem filtra é `getCourses`). Enquanto o
 * resultado novo chega, a lista anterior continua na tela. Quando nada combina, a tela diz isso,
 * mostra os cursos que existem e avisa que sem o curso não dá para continuar.
 *
 * @example
 * ```tsx
 * <CourseSearch courses={courses} onSelect={setSelectedCourseId} />
 * ```
 */
export function CourseSearch({ courses, onSelect }: CourseSearchProps): ReactNode {
  const [text, setText] = useState('')
  const term = useDeferredValue(text.trim())

  // `useQuery` e não `useSuspenseQuery`: a chave muda a cada tecla, e `keepPreviousData` evita o
  // pisca-pisca (doc/react-query.md, "useSuspenseQuery ou useQuery").
  const search = useQuery({ ...rulesQueries.courses(term), placeholderData: keepPreviousData })
  const hasFailed = search.isError && search.data === undefined
  const results = search.data ?? []
  const hasNoMatch = term !== '' && search.data !== undefined && results.length === 0

  return (
    <S.Root>
      <S.Intro>
        <S.Title>Qual é o seu curso?</S.Title>
        <S.Lead>Assim o SAACI sabe quais atividades contam e quanto cada uma vale.</S.Lead>
      </S.Intro>

      {/* TODO: o print do protótipo não tem rótulo nem placeholder neste campo. Validar com a equipe. */}
      <TextField
        label="Nome do curso"
        type="search"
        icon={Search}
        autoComplete="off"
        placeholder="Ex.: Engenharia"
        value={text}
        onChange={(event) => setText(event.target.value)}
      />

      {hasFailed ? (
        <Notice
          format="block"
          tone="danger"
          title="Não conseguimos buscar agora"
          actions={
            <Link as="button" type="button" onClick={() => void search.refetch()}>
              Tentar de novo
            </Link>
          }
        >
          Confira sua internet e tente de novo. O que você digitou continua aqui.
        </Notice>
      ) : null}

      {hasNoMatch ? (
        <>
          <Notice format="block" title={`Ainda não temos as regras de “${term}”`}>
            O SAACI está incluindo os cursos aos poucos, e o seu ainda não chegou. Se o nome tiver
            outra grafia, tente só uma parte dele.
          </Notice>
          <S.Group>
            <S.GroupTitle>Cursos com regras hoje</S.GroupTitle>
            <CourseList courses={courses} onSelect={onSelect} />
          </S.Group>
          <S.Footnote>
            Enquanto o seu curso não chega, não dá para continuar. Os dados da sua conta ficam
            guardados.
          </S.Footnote>
        </>
      ) : null}

      {!hasFailed && !hasNoMatch ? (
        <>
          <CourseList courses={results} onSelect={onSelect} />
          <S.Footnote>
            Só aparecem os cursos que já têm as regras no SAACI. Outros estão chegando.
          </S.Footnote>
        </>
      ) : null}
    </S.Root>
  )
}

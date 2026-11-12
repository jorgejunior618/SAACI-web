'use client'

import { valibotResolver } from '@hookform/resolvers/valibot'
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useForm } from 'react-hook-form'

import { Button, Link, Notice, TextField } from '@design-system'

import { invalidateAfterProfileWrite, updateProfile } from '@/services/profile'
import { rulesQueries } from '@/services/rules'
import type { Course } from '@/services/rules'
import { formatHours } from '@/utils/format-hours'

import { CourseConfirmSchema } from '../../schema'
import type { CourseConfirmInput, CourseConfirmOutput } from '../../schema'
import { AccountLinks } from '../AccountLinks'
import * as S from './styles'

export type CourseConfirmProps = {
  /** Curso que a pessoa escolheu na busca. */
  course: Course
  /** Chamada ao tocar em "Escolher outro", para voltar à busca. */
  onChooseOther: () => void
}

/**
 * Passo de confirmação: mostra a meta de horas do curso e pede o semestre de entrada.
 *
 * @remarks
 * Salva curso e semestre juntos com `updateProfile` e derruba o cache pela rotina do domínio
 * (`invalidateAfterProfileWrite`). Quem leva a pessoa ao painel é o `SessionGate`, que percebe o
 * curso no perfil. O botão fica ocupado também depois do sucesso, até a navegação acontecer, para
 * não aceitar um segundo toque. O que a pessoa digitou nunca é limpo depois de um erro (RNF24).
 * Precisa de um `Suspense` acima, porque lê os itens do curso com `useSuspenseQuery`.
 *
 * @example
 * ```tsx
 * <CourseConfirm course={course} onChooseOther={() => setSelectedCourseId(null)} />
 * ```
 */
export function CourseConfirm({ course, onChooseOther }: CourseConfirmProps): ReactNode {
  const queryClient = useQueryClient()
  const { data: items } = useSuspenseQuery(rulesQueries.items(course.id))
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CourseConfirmInput, unknown, CourseConfirmOutput>({
    resolver: valibotResolver(CourseConfirmSchema),
  })

  const mutation = useMutation({
    mutationFn: ({ startSemester }: CourseConfirmOutput) =>
      updateProfile({ courseId: course.id, startSemester }),
    onSuccess: () => invalidateAfterProfileWrite(queryClient),
  })

  return (
    <S.Form noValidate onSubmit={handleSubmit((values) => mutation.mutate(values))}>
      <S.Body>
        <S.Summary>
          <S.Eyebrow>
            {course.name} · {course.degree}
          </S.Eyebrow>
          <S.Lead>Seu curso pede</S.Lead>
          <S.Hours>{formatHours(course.targetHours, { fractionDigits: 0 })}</S.Hours>
          <S.Explanation>
            de atividades complementares. Elas podem vir de {items.length} tipos de atividade, como
            cursos, palestras e eventos.
          </S.Explanation>
        </S.Summary>

        <S.Fields>
          <TextField
            label="Em que semestre você entrou no curso?"
            hint="Só contam as atividades feitas a partir dele."
            inputMode="decimal"
            autoComplete="off"
            placeholder="2023.2"
            error={errors.startSemester?.message}
            {...register('startSemester')}
          />
          <Link as="button" type="button" isStandalone onClick={onChooseOther}>
            Não é esse curso? Escolher outro
          </Link>
        </S.Fields>

        {mutation.isError ? (
          <Notice tone="danger">
            Não conseguimos salvar agora. Confira sua internet e tente de novo. O que você digitou
            continua aqui.
          </Notice>
        ) : null}

        <AccountLinks />
      </S.Body>

      <S.Footer>
        <Button
          type="submit"
          block
          busy={mutation.isPending || mutation.isSuccess}
          busyLabel="Salvando"
        >
          Ver meu painel
        </Button>
      </S.Footer>
    </S.Form>
  )
}

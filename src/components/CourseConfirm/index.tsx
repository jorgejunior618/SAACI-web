// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

'use client'

import { valibotResolver } from '@hookform/resolvers/valibot'
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useForm } from 'react-hook-form'

import { Button, Link, Notice, TextField } from '@design-system'

import { CourseLockedError, invalidateAfterProfileWrite, updateProfile } from '@/services/profile'
import { rulesQueries } from '@/services/rules'
import type { Course } from '@/services/rules'
import { formatHours } from '@/utils/format-hours'

import { CourseConfirmSchema } from './schema'
import type { CourseConfirmInput, CourseConfirmOutput } from './schema'
import * as S from './styles'

/** Props de {@link CourseConfirm}. */
export type CourseConfirmProps = {
  /** Curso que a pessoa escolheu na busca. */
  course: Course
  /** Chamada ao tocar em "Escolher outro", para voltar à busca. */
  onChooseOther: () => void
  /** Texto do botão de salvar. Padrão: "Ver meu painel". */
  submitLabel?: string
  /** Semestre que já vem preenchido no campo, como se digita (`2023.2`). Padrão: vazio. */
  defaultStartSemester?: string
  /** Links de conta mostrados no fim do formulário, como o de sair. Padrão: nenhum. */
  footerLinks?: ReactNode
  /** Chamada depois que o curso foi salvo e o cache derrubado. Padrão: nada. */
  onSaved?: () => void
}

/**
 * Passo de confirmação: mostra a meta de horas do curso e pede o semestre de entrada.
 *
 * @remarks
 * Salva curso e semestre juntos com `updateProfile` e derruba o cache pela rotina do domínio
 * (`invalidateAfterProfileWrite`). No primeiro acesso, quem leva a pessoa ao painel é o `SessionGate`,
 * que percebe o curso no perfil; em outra tela, `onSaved` faz a navegação. O botão fica ocupado também depois do sucesso, até a navegação acontecer, para
 * não aceitar um segundo toque. O que a pessoa digitou nunca é limpo depois de um erro (RNF24). Se o
 * banco recusar a troca por atividade registrada (`CourseLockedError`), avisa isso em vez de pedir
 * para tentar de novo.
 * Precisa de um `Suspense` acima, porque lê os itens do curso com `useSuspenseQuery`.
 *
 * @example
 * ```tsx
 * <CourseConfirm course={course} onChooseOther={() => setSelectedCourseId(null)} />
 * ```
 */
export function CourseConfirm({
  course,
  onChooseOther,
  submitLabel = 'Ver meu painel',
  defaultStartSemester,
  footerLinks,
  onSaved,
}: CourseConfirmProps): ReactNode {
  const queryClient = useQueryClient()
  const { data: items } = useSuspenseQuery(rulesQueries.items(course.id))
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CourseConfirmInput, unknown, CourseConfirmOutput>({
    resolver: valibotResolver(CourseConfirmSchema),
    defaultValues: { startSemester: defaultStartSemester ?? '' },
  })

  const mutation = useMutation({
    mutationFn: ({ startSemester }: CourseConfirmOutput) =>
      updateProfile({ courseId: course.id, startSemester }),
    onSuccess: () => {
      invalidateAfterProfileWrite(queryClient)
      onSaved?.()
    },
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
            hint="Digite o ano e o semestre, como 2023.2. Só contam as atividades feitas a partir dele."
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

        {mutation.error instanceof CourseLockedError ? (
          <Notice tone="warning">
            Você já tem atividades registradas, então o curso não pode mudar. Volte ao perfil para
            ver os caminhos de troca.
          </Notice>
        ) : mutation.isError ? (
          <Notice tone="danger">
            Não conseguimos salvar agora. Confira sua internet e tente de novo. O que você digitou
            continua aqui.
          </Notice>
        ) : null}

        {footerLinks}
      </S.Body>

      <S.Footer>
        <Button
          type="submit"
          block
          busy={mutation.isPending || mutation.isSuccess}
          busyLabel="Salvando"
        >
          {submitLabel}
        </Button>
      </S.Footer>
    </S.Form>
  )
}

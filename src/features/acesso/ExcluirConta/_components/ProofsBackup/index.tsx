// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

'use client'

import { useQuery } from '@tanstack/react-query'
import type { ReactNode } from 'react'

import { Notice } from '@design-system'

import { ProofsDownload } from '@/components/ProofsDownload'
import { activitiesQueries } from '@/services/activities'
import { rulesQueries } from '@/services/rules'

import * as S from './styles'

/** Props de {@link ProofsBackup}. */
export type ProofsBackupProps = {
  /** Curso do aluno, para dar nome às pastas do arquivo pelos itens dele. */
  courseId: string
}

/**
 * Cópia de segurança dos comprovantes, oferecida antes de o aluno apagar a conta.
 *
 * @remarks
 * Baixa todos os comprovantes, também os que não contam, porque depois da exclusão não há como
 * recuperar nenhum (`scope="all"` do `ProofsDownload`). Usa `useQuery`, não `useSuspenseQuery`: se a
 * busca falhar, a tela de exclusão continua usável e só esta parte avisa. Sem atividade, não mostra
 * nada. Enquanto carrega, também não, para o formulário não pular.
 *
 * @example
 * ```tsx
 * <ProofsBackup courseId={profile.courseId} />
 * ```
 */
export function ProofsBackup({ courseId }: ProofsBackupProps): ReactNode {
  const activities = useQuery(activitiesQueries.list())
  const items = useQuery(rulesQueries.items(courseId))

  if (activities.isError || items.isError) {
    return (
      <Notice tone="danger">
        Não conseguimos carregar seus comprovantes agora. Abra Atividades para baixá-los antes de
        apagar, ou tente de novo em instantes.
      </Notice>
    )
  }

  if (!activities.data || !items.data || activities.data.length === 0) return null

  return (
    <S.Root>
      <Notice>
        Antes de apagar, baixe seus comprovantes. Depois da exclusão não dá para recuperá-los.
      </Notice>
      <ProofsDownload activities={activities.data} ruleItems={items.data} scope="all" />
    </S.Root>
  )
}

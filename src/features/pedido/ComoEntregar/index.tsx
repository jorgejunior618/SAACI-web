// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

'use client'

import { useSuspenseQueries } from '@tanstack/react-query'
import NextLink from 'next/link'
import type { ReactNode } from 'react'

import { AppFrame, Card, Link, TopBar } from '@design-system'

import { MainNav } from '@/components/MainNav'
import { activitiesQueries } from '@/services/activities'
import { profileQueries } from '@/services/profile'
import { progressQueries } from '@/services/progress'
import { rulesQueries } from '@/services/rules'
import { buildFormRows, formatFormHeader } from '@/utils/coordination-form'

import { DeliverySteps } from './_components/DeliverySteps'
import * as S from './styles'

/**
 * Tela Como entregar: baixa o formulário e os comprovantes e guia a entrega no IFCE, passo a passo.
 *
 * @remarks
 * Hoje a entrega é manual: e-mail para o protocolo, ida à recepção e acompanhamento por e-mail. O
 * aluno marca o que já fez, e baixar marca sozinho. Os checks vivem só nesta tela. Lê atividades,
 * progresso, perfil e curso para gerar o PDF e o arquivo dos comprovantes e para deixar o e-mail
 * preenchido, e não soma horas (RNF20). Não tem `Empty`: o guia serve com qualquer estado do pedido.
 * A página envolve este componente em `Suspense`, com `Loading` como fallback.
 *
 * @example
 * ```tsx
 * <Suspense fallback={<Loading />}>
 *   <ComoEntregar />
 * </Suspense>
 * ```
 */
export function ComoEntregar(): ReactNode {
  const [{ data: activities }, { data: progress }, { data: profile }] = useSuspenseQueries({
    queries: [activitiesQueries.list(), progressQueries.summary(), profileQueries.detail()],
  })

  // O SessionGate leva quem não tem curso para Seu curso, então aqui o curso sempre existe.
  if (profile.courseId === null) throw new Error('O Como entregar abriu sem curso no perfil.')

  // Dependem do perfil, então esperam a busca de cima. As duas saem juntas.
  const [{ data: course }, { data: ruleItems }] = useSuspenseQueries({
    queries: [rulesQueries.course(profile.courseId), rulesQueries.items(profile.courseId)],
  })

  if (course === null) throw new Error(`O curso ${profile.courseId} do perfil não existe.`)

  return (
    <AppFrame
      topBar={
        <TopBar
          variant="inner"
          title="Como entregar"
          backHref="/atividades/pedido"
          linkAs={NextLink}
        />
      }
      bottomNav={<MainNav />}
    >
      <S.Page>
        <S.Header>
          <S.Headline>Entregar na coordenação</S.Headline>
          <S.Lead>
            A entrega começa por e-mail e termina na recepção do IFCE. Siga os passos na ordem e
            marque o que já fez.
          </S.Lead>
        </S.Header>

        <Card>
          <DeliverySteps
            courseName={course.name}
            form={{
              header: formatFormHeader(course),
              studentName: profile.name,
              enrollmentId: profile.enrollmentId,
              rows: buildFormRows(ruleItems, progress),
              totalHours: progress.totalHours,
            }}
            activities={activities}
            ruleItems={ruleItems}
          />
        </Card>

        <Link as={NextLink} href="/atividades/pedido" isStandalone>
          Voltar ao meu pedido
        </Link>
      </S.Page>
    </AppFrame>
  )
}

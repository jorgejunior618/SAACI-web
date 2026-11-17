'use client'

import { useSuspenseQueries } from '@tanstack/react-query'
import NextLink from 'next/link'
import type { ReactNode } from 'react'

import { AppFrame, Button, TopBar } from '@design-system'

import { MainNav } from '@/components/MainNav'
import { activitiesQueries } from '@/services/activities'
import { profileQueries } from '@/services/profile'
import { progressQueries } from '@/services/progress'
import { rulesQueries } from '@/services/rules'

import { ChecklistCard } from './_components/ChecklistCard'
import { FormSummary } from './_components/FormSummary'
import { Empty } from './Empty'
import {
  buildChecks,
  buildFormRows,
  formatBlankRowsNote,
  formatOverflowNote,
  formatPendingTitle,
} from './utils'
import * as S from './styles'

/**
 * Tela Seu pedido: o que falta para o formulário da coordenação e o que vai nele.
 *
 * @remarks
 * Só compõe `progress`, `profile`, `activities` e `rules`: não tem service próprio e não soma horas
 * (RNF20). O estado "pronto" ou "incompleto" sai dos dados, não de um `useState`. Nome e matrícula
 * levam ao Perfil, onde se edita, então a tela não grava nada. Sem atividade, mostra o `Empty`. A
 * página envolve este componente em `Suspense`, com `Loading` como fallback.
 *
 * @example
 * ```tsx
 * <Suspense fallback={<Loading />}>
 *   <Pedido />
 * </Suspense>
 * ```
 */
export function Pedido(): ReactNode {
  const [{ data: activities }, { data: progress }, { data: profile }] = useSuspenseQueries({
    queries: [activitiesQueries.list(), progressQueries.summary(), profileQueries.detail()],
  })

  // O SessionGate leva quem não tem curso para Seu curso, então aqui o curso sempre existe.
  if (profile.courseId === null) throw new Error('O Seu pedido abriu sem curso no perfil.')

  // Dependem do perfil, então esperam a busca de cima. As duas saem juntas.
  const [{ data: course }, { data: ruleItems }] = useSuspenseQueries({
    queries: [rulesQueries.course(profile.courseId), rulesQueries.items(profile.courseId)],
  })

  if (course === null) throw new Error(`O curso ${profile.courseId} do perfil não existe.`)
  if (activities.length === 0) return <Empty />

  const checks = buildChecks({ progress, profile, activities })
  const rows = buildFormRows(ruleItems, progress)
  const pendingCount = checks.filter((check) => !check.isDone).length
  const isReady = pendingCount === 0

  // TODO: provisório. A prévia e o download do PDF entram na etapa 3 da issue #14.
  function openPreview(): void {}

  return (
    <AppFrame
      topBar={
        <TopBar variant="inner" title="Seu pedido" backHref="/atividades" linkAs={NextLink} />
      }
      bottomNav={
        <>
          <S.Footer>
            {isReady ? (
              <Button block onClick={openPreview}>
                Pré-visualizar e baixar
              </Button>
            ) : (
              <>
                <Button variant="secondary" block onClick={openPreview}>
                  Pré-visualizar como está
                </Button>
                <S.FooterHint>
                  Dá para baixar antes de completar, se a coordenação aceitar.
                </S.FooterHint>
              </>
            )}
          </S.Footer>
          <MainNav />
        </>
      }
    >
      <S.Page>
        <S.Header>
          <S.Headline tone={isReady ? 'ready' : 'pending'}>{formatPendingTitle(checks)}</S.Headline>
          <S.Lead>
            {isReady
              ? 'O SAACI preencheu o formulário da coordenação com as suas horas. Confira e baixe.'
              : `O resto o SAACI já preencheu. Toque ${pendingCount === 1 ? 'nela' : 'em cada uma'} para resolver.`}
          </S.Lead>
        </S.Header>

        <ChecklistCard checks={checks} />

        <FormSummary
          rows={rows}
          totalHours={progress.totalHours}
          courseName={course.name}
          overflowNote={formatOverflowNote(progress)}
          blankNote={formatBlankRowsNote(rows)}
        />
      </S.Page>
    </AppFrame>
  )
}

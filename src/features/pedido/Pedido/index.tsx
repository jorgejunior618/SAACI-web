'use client'

import { useSuspenseQueries } from '@tanstack/react-query'
import NextLink from 'next/link'
import { useState } from 'react'
import type { ReactNode } from 'react'

import { AppFrame, Button, TopBar } from '@design-system'

import { MainNav } from '@/components/MainNav'
import { activitiesQueries } from '@/services/activities'
import { profileQueries } from '@/services/profile'
import { progressQueries } from '@/services/progress'
import { rulesQueries } from '@/services/rules'

import { ChecklistCard } from './_components/ChecklistCard'
import { DownloadedStep } from './_components/DownloadedStep'
import { FormSummary } from './_components/FormSummary'
import { PreviewStep } from './_components/PreviewStep'
import { Empty } from './Empty'
import {
  buildChecks,
  buildFormRows,
  formatBlankRowsNote,
  formatFormHeader,
  formatOverflowNote,
  formatPendingTitle,
} from './utils'
import type { DownloadedFile } from './utils'
import * as S from './styles'

// Em que ponto do fluxo o aluno está. A conferência é a entrada; a prévia guarda o momento em que
// foi aberta, e o baixado guarda o PDF gerado.
type Step =
  | { name: 'review' }
  | { name: 'preview'; generatedAt: Date }
  | { name: 'downloaded'; file: DownloadedFile }

/**
 * Tela Seu pedido: o que falta para o formulário da coordenação e o que vai nele.
 *
 * @remarks
 * Só compõe `progress`, `profile`, `activities` e `rules`: não tem service próprio e não soma horas
 * (RNF20). O estado "pronto" ou "incompleto" sai dos dados, não de um `useState`. O `useState` guarda
 * só o passo do fluxo: conferir, pré-visualizar e baixado. Nome e matrícula levam ao Perfil, onde se
 * edita, então a tela não grava nada. Sem atividade, mostra o `Empty`. A página envolve este
 * componente em `Suspense`, com `Loading` como fallback.
 *
 * @example
 * ```tsx
 * <Suspense fallback={<Loading />}>
 *   <Pedido />
 * </Suspense>
 * ```
 */
export function Pedido(): ReactNode {
  const [step, setStep] = useState<Step>({ name: 'review' })
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

  // Cada passo é uma tela nova: sobe ao topo para não abrir no meio da página da conferência.
  function goTo(next: Step): void {
    setStep(next)
    window.scrollTo({ top: 0 })
  }

  function openPreview(): void {
    goTo({ name: 'preview', generatedAt: new Date() })
  }

  if (step.name === 'preview') {
    return (
      <PreviewStep
        header={formatFormHeader(course)}
        studentName={profile.name}
        enrollmentId={profile.enrollmentId}
        rows={rows}
        totalHours={progress.totalHours}
        generatedAt={step.generatedAt}
        onBack={() => goTo({ name: 'review' })}
        onDownloaded={(file) => goTo({ name: 'downloaded', file })}
      />
    )
  }

  if (step.name === 'downloaded') {
    return (
      <DownloadedStep
        file={step.file}
        email={{
          name: profile.name,
          enrollmentId: profile.enrollmentId,
          courseName: course.name,
          totalHours: progress.totalHours,
        }}
        onBack={() => goTo({ name: 'review' })}
      />
    )
  }

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

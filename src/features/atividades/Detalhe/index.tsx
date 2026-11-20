'use client'

import {
  useMutation,
  useQueryClient,
  useSuspenseQueries,
  useSuspenseQuery,
} from '@tanstack/react-query'
import NextLink from 'next/link'
import { notFound, useRouter } from 'next/navigation'
import { useRef, useState } from 'react'
import type { ReactNode } from 'react'

import { AppFrame, Badge, BottomSheet, Button, Card, Notice, TopBar } from '@design-system'
import type { BottomSheetHandle } from '@design-system'

import { MainNav } from '@/components/MainNav'
import {
  activitiesQueries,
  ActivityNotFoundError,
  invalidateAfterActivityRemoval,
  removeActivity,
} from '@/services/activities'
import { profileQueries } from '@/services/profile'
import { progressQueries } from '@/services/progress'
import { rulesQueries } from '@/services/rules'
import { describeQuantity, formatBrDate } from '@/utils/activity-form'

import { CorrectionForm } from './_components/CorrectionForm'
import { HoursSummary } from './_components/HoursSummary'
import { ProofCard } from './_components/ProofCard'
import {
  describeRemoval,
  describeWhy,
  formatRegisteredDate,
  getCalcRows,
  getRoomHours,
  getStatusBadge,
  getTotalAfterRemoval,
} from './utils'
import * as S from './styles'

/** Props de {@link Detalhe}. */
export type DetalheProps = {
  /** Identificador da atividade, do segmento `[id]` da rota. */
  id: string
}

/**
 * Tela Detalhe da atividade: quanto ela conta e por quê, os dados, o comprovante e a remoção.
 *
 * @remarks
 * Não recalcula horas (RNF20): o número e o status vêm do service, e o "Cabia no item" soma o que as
 * atividades registradas antes já contam. "Corrigir dados" troca a tela pelo `CorrectionForm`; ao
 * salvar, volta ao detalhe com o aviso de correção salva. Atividade que não existe (ou é de outro aluno) chama
 * `notFound()`. Remover pede confirmação no `BottomSheet`, apaga o comprovante junto e chama
 * `invalidateAfterActivityRemoval`, que não derruba este detalhe: com a outra rotina, o `notFound()`
 * dispararia antes da volta à lista. Atividade que já não existia (removida em outra aba) conta como
 * remoção concluída. Espera a lista e o total novos antes de voltar, para Atividades
 * já abrir certa, com o aviso de remoção pelo `?removida=`. A página envolve este componente em
 * `Suspense`, com `Loading` como fallback.
 *
 * @example
 * ```tsx
 * <Suspense fallback={<Loading />}>
 *   <Detalhe id={id} />
 * </Suspense>
 * ```
 */
export function Detalhe({ id }: DetalheProps): ReactNode {
  const router = useRouter()
  const queryClient = useQueryClient()
  const removeSheetRef = useRef<BottomSheetHandle>(null)
  const [isCorrecting, setIsCorrecting] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [{ data: activity }, { data: activities }, { data: progress }, { data: profile }] =
    useSuspenseQueries({
      queries: [
        activitiesQueries.detail(id),
        activitiesQueries.list(),
        progressQueries.summary(),
        profileQueries.detail(),
      ],
    })
  const removing = useMutation({
    mutationFn: async () => {
      try {
        await removeActivity(id)
      } catch (error) {
        // Já removida (em outra aba, por exemplo): o desfecho que o aluno pediu já aconteceu. Vira
        // sucesso aqui, e não no `onError`, para a tela nunca mostrar "não foi removida" enquanto volta.
        if (!(error instanceof ActivityNotFoundError)) throw error
      }
    },
    onSuccess: () => finishRemoval(),
    onError: () => closeSheet(),
  })

  // O SessionGate leva quem não tem curso para Seu curso, então aqui o curso sempre existe.
  if (profile.courseId === null) throw new Error('O Detalhe abriu sem curso no perfil.')

  // Depende do perfil, então espera as buscas de cima, que saem juntas.
  const { data: ruleItems } = useSuspenseQuery(rulesQueries.items(profile.courseId))

  if (activity === null) notFound()

  const rule = ruleItems.find((item) => item.itemNumber === activity.itemNumber)

  // A FK do banco amarra a atividade a um item do curso, então isto só acontece se as regras mudarem.
  if (!rule) throw new Error(`O item ${activity.itemNumber} não está nas regras do curso.`)

  const name = activity.name
  const badge = getStatusBadge(activity.status)
  const quantity = describeQuantity(activity.quantity, rule.ratio.unit)
  const roomHours = getRoomHours(activity, activities, rule.maxHours)
  const totalAfterRemoval = getTotalAfterRemoval({
    activity,
    activities,
    ruleItems,
    startSemester: profile.startSemester,
    targetHours: progress.targetHours,
  })

  // Espera lista e total novos, para Atividades abrir sem a atividade removida e com o total certo.
  // Se a busca falhar, a remoção já aconteceu: volta mesmo assim, nunca vira erro.
  async function finishRemoval(): Promise<void> {
    invalidateAfterActivityRemoval(queryClient)
    await Promise.all([
      queryClient.fetchQuery(activitiesQueries.list()),
      queryClient.fetchQuery(progressQueries.summary()),
    ]).catch(() => undefined)
    router.replace(`/atividades?removida=${encodeURIComponent(name)}`)
  }

  function startCorrecting(): void {
    setIsSaved(false)
    removing.reset()
    setIsCorrecting(true)
  }

  function finishCorrecting(): void {
    setIsCorrecting(false)
    setIsSaved(true)
    window.scrollTo(0, 0)
  }

  function closeSheet(): void {
    removeSheetRef.current?.close()
  }

  function openSheet(): void {
    removing.reset()
    setIsSaved(false)
    removeSheetRef.current?.open()
  }

  if (isCorrecting) {
    return (
      <CorrectionForm
        activity={activity}
        activities={activities}
        ruleItems={ruleItems}
        startSemester={profile.startSemester}
        onCancel={() => setIsCorrecting(false)}
        onSaved={finishCorrecting}
      />
    )
  }

  return (
    <AppFrame
      topBar={<TopBar variant="inner" title="Atividade" backHref="/atividades" linkAs={NextLink} />}
      bottomNav={<MainNav />}
    >
      <S.Page>
        {isSaved ? (
          <Notice format="block" tone="success" title="Correção salva" role="status">
            As horas abaixo já contam com os dados novos.
          </Notice>
        ) : null}

        {removing.isError ? (
          <Notice format="block" tone="danger" title="A atividade não foi removida" role="alert">
            Ela e o comprovante continuam aqui. Confira a internet e toque em Remover atividade de
            novo.
          </Notice>
        ) : null}

        <S.Header>
          <Badge tone={badge.tone}>{badge.label}</Badge>
          <S.Name>{activity.name}</S.Name>
          <S.ItemName>
            Item {rule.itemNumber} · {rule.name}
          </S.ItemName>
        </S.Header>

        <HoursSummary
          activity={activity}
          why={describeWhy(activity, rule, profile.startSemester)}
          calcRows={getCalcRows(activity, rule, roomHours)}
        />

        <S.Section aria-labelledby="dados-da-atividade">
          <S.SectionTitle id="dados-da-atividade">Dados da atividade</S.SectionTitle>
          <Card>
            <S.Data>
              <S.DataRow>
                <S.DataLabel>{quantity.label}</S.DataLabel>
                <S.DataValue>{quantity.value}</S.DataValue>
              </S.DataRow>
              <S.DataRow>
                <S.DataLabel>Terminou em</S.DataLabel>
                <S.DataValue>{formatBrDate(activity.endDate)}</S.DataValue>
              </S.DataRow>
              <S.DataRow>
                <S.DataLabel>Registrada em</S.DataLabel>
                <S.DataValue>{formatRegisteredDate(activity.registeredAt)}</S.DataValue>
              </S.DataRow>
            </S.Data>
          </Card>
        </S.Section>

        <S.Section aria-labelledby="comprovante">
          <S.SectionTitle id="comprovante">Comprovante</S.SectionTitle>
          <ProofCard activity={activity} />
        </S.Section>

        <S.Actions>
          <Button variant="secondary" block onClick={startCorrecting}>
            Corrigir dados
          </Button>
          <Button variant="tertiary" block onClick={openSheet}>
            Remover atividade
          </Button>
        </S.Actions>
      </S.Page>

      <BottomSheet
        ref={removeSheetRef}
        title="Remover esta atividade?"
        description={`${describeRemoval(name, progress.totalHours, totalAfterRemoval)} Se só um dado está errado, use Corrigir dados.`}
        actions={
          <>
            <Button
              variant="danger"
              block
              busy={removing.isPending}
              busyLabel="Removendo"
              onClick={() => removing.mutate()}
            >
              Remover atividade
            </Button>
            <Button variant="secondary" block onClick={closeSheet}>
              Manter
            </Button>
          </>
        }
      />
    </AppFrame>
  )
}

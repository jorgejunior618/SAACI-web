'use client'

import {
  useMutation,
  useQueryClient,
  useSuspenseQueries,
  useSuspenseQuery,
} from '@tanstack/react-query'
import NextLink from 'next/link'
import { notFound, useRouter } from 'next/navigation'
import { useRef } from 'react'
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

import { HoursSummary } from './_components/HoursSummary'
import { ProofCard } from './_components/ProofCard'
import {
  describeRemoval,
  describeWhy,
  formatRegisteredDate,
  getCalcRows,
  getRoomHours,
  getStatusBadge,
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
 * atividades registradas antes já contam. Atividade que não existe (ou é de outro aluno) chama
 * `notFound()`. Remover pede confirmação no `BottomSheet`, apaga o comprovante junto e chama
 * `invalidateAfterActivityRemoval`, que não derruba este detalhe: com a outra rotina, o `notFound()`
 * dispararia antes da volta à lista. Espera a lista e o total novos antes de voltar, para Atividades
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
    mutationFn: () => removeActivity(id),
    onSuccess: () => finishRemoval(),
    // Já removida (em outra aba, por exemplo): o desfecho que o aluno pediu já aconteceu.
    onError: (error) => (error instanceof ActivityNotFoundError ? finishRemoval() : closeSheet()),
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

  function closeSheet(): void {
    removeSheetRef.current?.close()
  }

  function openSheet(): void {
    removing.reset()
    removeSheetRef.current?.open()
  }

  return (
    <AppFrame
      topBar={<TopBar variant="inner" title="Atividade" backHref="/atividades" linkAs={NextLink} />}
      bottomNav={<MainNav />}
    >
      <S.Page>
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
          <Button variant="tertiary" block onClick={openSheet}>
            Remover atividade
          </Button>
        </S.Actions>
      </S.Page>

      <BottomSheet
        ref={removeSheetRef}
        title="Remover esta atividade?"
        description={describeRemoval(activity, progress.totalHours)}
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

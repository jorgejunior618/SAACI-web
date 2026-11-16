'use client'

import { useSuspenseQueries, useSuspenseQuery } from '@tanstack/react-query'
import { ChevronRight } from 'lucide-react'
import NextLink from 'next/link'
import { useState } from 'react'
import type { ReactNode } from 'react'

import { ActivityRow, AppFrame, Card, Disclosure, Icon, Link, TopBar } from '@design-system'
import type { ActivityRowSelection } from '@design-system'

import { MainNav } from '@/components/MainNav'
import { activitiesQueries } from '@/services/activities'
import type { Activity } from '@/services/activities'
import { profileQueries } from '@/services/profile'
import { progressQueries } from '@/services/progress'
import { rulesQueries } from '@/services/rules'
import { formatHours } from '@/utils/format-hours'

import { ItemSelectAll } from './_components/ItemSelectAll'
import { ProofsDownload } from './_components/ProofsDownload'
import { Empty } from './Empty'
import {
  formatDate,
  formatProofsSummary,
  formatReason,
  getCountingIds,
  groupActivitiesByItem,
  isCounting,
  isItemFullySelected,
  toggleItemSelection,
} from './utils'
import * as S from './styles'

/** Props de {@link Atividades}. */
export type AtividadesProps = {
  /** Item que já abre aberto, vindo de `?item=` (o Início manda para cá). `null`: todos fechados. */
  openItem: number | null
}

type ActivityItemProps = {
  activity: Activity
  /** Checkbox do modo "Escolher quais". Só quem conta recebe. */
  selection?: ActivityRowSelection
}

// A linha mostra o que o service decidiu: `status` vira a variante, sem refazer conta. No modo de
// seleção a linha só marca; fora dele, leva ao Detalhe.
function ActivityItem({ activity, selection }: ActivityItemProps): ReactNode {
  const common = selection
    ? { title: activity.name, selection }
    : { title: activity.name, href: `/atividades/${activity.id}`, linkAs: NextLink }

  switch (activity.status) {
    case 'conta':
      return (
        <ActivityRow
          {...common}
          status="counts"
          countedHours={activity.countedHours}
          endDate={formatDate(activity.endDate)}
        />
      )
    case 'parcial':
      return (
        <ActivityRow
          {...common}
          status="partial"
          countedHours={activity.countedHours}
          activityHours={activity.activityHours}
          endDate={formatDate(activity.endDate)}
        />
      )
    case 'nao_conta':
      return (
        <ActivityRow {...common} status="doesNotCount" reason={formatReason(activity.reason)} />
      )
  }
}

/**
 * Tela Atividades: quantas horas contam, os comprovantes e as atividades agrupadas por item.
 *
 * @remarks
 * Não soma horas: o total vem de `getProgress` e as horas de cada item de `progress.categories`
 * (RNF20). O nome e o máximo do item vêm das regras do curso. Sem atividade, mostra o `Empty`. A
 * página envolve este componente em `Suspense`, com `Loading` como fallback.
 *
 * "Escolher quais" abre todos os itens e liga o checkbox nas atividades que contam, todas já
 * marcadas; o download passa a levar só as marcadas. No modo, a linha inteira só marca: nada leva ao
 * Detalhe, a que não conta aparece desabilitada e "Ver meu pedido" some. Cada item ganha "Marcar
 * todos do item". A seleção vive só nesta tela: sair e voltar começa de novo.
 *
 * @example
 * ```tsx
 * <Suspense fallback={<Loading />}>
 *   <Atividades openItem={7} />
 * </Suspense>
 * ```
 */
export function Atividades({ openItem }: AtividadesProps): ReactNode {
  // `null`: fora do modo de seleção. Os hooks vêm antes de qualquer retorno antecipado.
  const [selectedIds, setSelectedIds] = useState<ReadonlySet<string> | null>(null)
  // Sobe a cada entrada no modo: troca a `key` dos itens, que remontam abertos. Ao sair, nada muda,
  // e os itens ficam como o aluno deixou.
  const [openRound, setOpenRound] = useState(0)
  const [{ data: activities }, { data: progress }, { data: profile }] = useSuspenseQueries({
    queries: [activitiesQueries.list(), progressQueries.summary(), profileQueries.detail()],
  })

  // O SessionGate leva quem não tem curso para Seu curso, então aqui o curso sempre existe.
  if (profile.courseId === null) throw new Error('As Atividades abriram sem curso no perfil.')

  // Depende do perfil, então espera a busca de cima. As três de cima saem juntas.
  const { data: ruleItems } = useSuspenseQuery(rulesQueries.items(profile.courseId))

  if (activities.length === 0) return <Empty />

  const groups = groupActivitiesByItem(activities, ruleItems, progress.categories)
  const hasCounting = activities.some(isCounting)

  const isSelecting = selectedIds !== null

  function toggleSelecting(): void {
    if (isSelecting) {
      setSelectedIds(null)
      return
    }
    setSelectedIds(new Set(getCountingIds(activities)))
    setOpenRound((round) => round + 1)
  }

  function toggleItem(itemIds: string[]): void {
    setSelectedIds((current) => toggleItemSelection(current ?? new Set(), itemIds))
  }

  function selectionFor(activity: Activity): ActivityRowSelection | undefined {
    if (!selectedIds) return undefined
    if (!isCounting(activity))
      return { checked: false, onChange: () => undefined, isDisabled: true }

    return {
      checked: selectedIds.has(activity.id),
      onChange: (checked) =>
        setSelectedIds((current) => {
          const next = new Set(current)

          if (checked) next.add(activity.id)
          else next.delete(activity.id)
          return next
        }),
    }
  }

  return (
    <AppFrame topBar={<TopBar variant="root" title="Atividades" />} bottomNav={<MainNav />}>
      <S.Page>
        <Card>
          <S.Summary>
            <S.Total>
              <S.TotalNumber>
                {formatHours(progress.totalHours, { fractionDigits: 0 })}
              </S.TotalNumber>
              <S.TotalLabel>contam no seu total</S.TotalLabel>
            </S.Total>
            <S.SummaryText>{formatProofsSummary(activities)}</S.SummaryText>
          </S.Summary>

          <ProofsDownload activities={activities} ruleItems={ruleItems} selectedIds={selectedIds} />

          <S.SummaryFooter>
            {hasCounting ? (
              <Link as="button" type="button" isStandalone onClick={toggleSelecting}>
                {isSelecting ? 'Cancelar seleção' : 'Escolher quais'}
              </Link>
            ) : null}
            {/* No modo de seleção nada tira o aluno da tela, para a seleção não se perder. */}
            {isSelecting ? null : (
              <S.FooterEnd>
                <Link as={NextLink} href="/atividades/pedido" isStandalone>
                  <S.LinkContent>
                    Ver meu pedido
                    <Icon icon={ChevronRight} size="sm" />
                  </S.LinkContent>
                </Link>
              </S.FooterEnd>
            )}
          </S.SummaryFooter>
        </Card>

        <S.Section>
          <S.SectionHeader>
            <S.SectionTitle>Por item</S.SectionTitle>
            <S.SectionHint>
              {isSelecting
                ? 'Toque nas atividades para marcar ou desmarcar.'
                : 'Toque numa atividade para ver os detalhes, corrigir ou remover.'}
            </S.SectionHint>
          </S.SectionHeader>
          <S.GroupList>
            {groups.map((group) => {
              const itemIds = getCountingIds(group.activities)

              return (
                <Disclosure
                  key={`${group.itemNumber}-${openRound}`}
                  id={`item-${group.itemNumber}`}
                  eyebrow={`Item ${group.itemNumber}`}
                  title={group.name}
                  aside={`${formatHours(group.countedHours)} de ${formatHours(group.maxHours, { fractionDigits: 0 })}`}
                  // Fica `true` depois da primeira entrada no modo: mudar de volta fecharia os itens.
                  defaultOpen={openRound > 0 || group.itemNumber === openItem}
                >
                  {selectedIds && itemIds.length > 0 ? (
                    <ItemSelectAll
                      itemNumber={group.itemNumber}
                      isAllSelected={isItemFullySelected(selectedIds, itemIds)}
                      onToggle={() => toggleItem(itemIds)}
                    />
                  ) : null}
                  {group.activities.map((activity) => (
                    <ActivityItem
                      key={activity.id}
                      activity={activity}
                      selection={selectionFor(activity)}
                    />
                  ))}
                </Disclosure>
              )
            })}
          </S.GroupList>
        </S.Section>
      </S.Page>
    </AppFrame>
  )
}

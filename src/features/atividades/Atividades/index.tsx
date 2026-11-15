'use client'

import { useSuspenseQueries, useSuspenseQuery } from '@tanstack/react-query'
import { ChevronRight } from 'lucide-react'
import NextLink from 'next/link'
import type { ReactNode } from 'react'

import { ActivityRow, AppFrame, Card, Disclosure, Icon, Link, TopBar } from '@design-system'

import { MainNav } from '@/components/MainNav'
import { activitiesQueries } from '@/services/activities'
import type { Activity } from '@/services/activities'
import { profileQueries } from '@/services/profile'
import { progressQueries } from '@/services/progress'
import { rulesQueries } from '@/services/rules'
import { formatDate } from '@/utils/format-date'
import { formatHours } from '@/utils/format-hours'

import { Empty } from './Empty'
import { formatProofsSummary, formatReason, groupActivitiesByItem } from './utils'
import * as S from './styles'

/** Props de {@link Atividades}. */
export type AtividadesProps = {
  /** Item que já abre aberto, vindo de `?item=` (o Início manda para cá). `null`: todos fechados. */
  openItem: number | null
}

// A linha mostra o que o service decidiu: `status` vira a variante, sem refazer conta.
function ActivityItem({ activity }: { activity: Activity }): ReactNode {
  const common = { title: activity.name, href: `/atividades/${activity.id}`, linkAs: NextLink }

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
 * @example
 * ```tsx
 * <Suspense fallback={<Loading />}>
 *   <Atividades openItem={7} />
 * </Suspense>
 * ```
 */
export function Atividades({ openItem }: AtividadesProps): ReactNode {
  const [{ data: activities }, { data: progress }, { data: profile }] = useSuspenseQueries({
    queries: [activitiesQueries.list(), progressQueries.summary(), profileQueries.detail()],
  })

  // O SessionGate leva quem não tem curso para Seu curso, então aqui o curso sempre existe.
  if (profile.courseId === null) throw new Error('As Atividades abriram sem curso no perfil.')

  // Depende do perfil, então espera a busca de cima. As três de cima saem juntas.
  const { data: ruleItems } = useSuspenseQuery(rulesQueries.items(profile.courseId))

  if (activities.length === 0) return <Empty />

  const groups = groupActivitiesByItem(activities, ruleItems, progress.categories)

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

          <S.SummaryFooter>
            <Link as={NextLink} href="/atividades/pedido" isStandalone>
              <S.LinkContent>
                Ver meu pedido
                <Icon icon={ChevronRight} size="sm" />
              </S.LinkContent>
            </Link>
          </S.SummaryFooter>
        </Card>

        <S.Section>
          <S.SectionTitle>Por item</S.SectionTitle>
          <S.GroupList>
            {groups.map((group) => (
              <Disclosure
                key={group.itemNumber}
                id={`item-${group.itemNumber}`}
                eyebrow={`Item ${group.itemNumber}`}
                title={group.name}
                aside={`${formatHours(group.countedHours)} de ${formatHours(group.maxHours, { fractionDigits: 0 })}`}
                defaultOpen={group.itemNumber === openItem}
              >
                {group.activities.map((activity) => (
                  <ActivityItem key={activity.id} activity={activity} />
                ))}
              </Disclosure>
            ))}
          </S.GroupList>
        </S.Section>
      </S.Page>
    </AppFrame>
  )
}

'use client'

import { useSuspenseQuery } from '@tanstack/react-query'
import NextLink from 'next/link'
import type { ReactNode } from 'react'

import { AppFrame, CategoryCard, Disclosure, Notice, TopBar, TotalProgress } from '@design-system'

import { MainNav } from '@/components/MainNav'
import { profileQueries } from '@/services/profile'
import { progressQueries } from '@/services/progress'
import { rulesQueries } from '@/services/rules'

import { Empty } from './Empty'
import { formatLimitNotice, getItemsWithoutHours, sortCategoriesForPanel } from './utils'
import * as S from './styles'

/**
 * Tela Início: quanto falta para a meta, onde o aluno já tem horas e o que ainda soma.
 *
 * @remarks
 * Não soma horas: o total, a meta e as horas de cada item vêm prontos de `getProgress` (RNF20). A
 * tela só decide o que mostrar. Com a meta cumprida, o cartão do total vira o estado completo e o
 * aviso de limite some. Com algum item cheio e a meta por cumprir, o aviso aparece acima do total e
 * os itens cheios sobem na lista. A página envolve este componente em `Suspense`, com `Loading`
 * como fallback.
 *
 * @example
 * ```tsx
 * <Suspense fallback={<Loading />}>
 *   <Inicio />
 * </Suspense>
 * ```
 */
export function Inicio(): ReactNode {
  const { data: progress } = useSuspenseQuery(progressQueries.summary())
  const { data: profile } = useSuspenseQuery(profileQueries.detail())
  const { data: ruleItems } = useSuspenseQuery(rulesQueries.items(profile.courseId ?? ''))

  if (progress.categories.length === 0) {
    return <Empty targetHours={progress.targetHours} ruleItems={ruleItems} />
  }

  const isComplete = progress.totalHours >= progress.targetHours
  const notice = isComplete ? null : formatLimitNotice(progress.categories, ruleItems)
  const categories = sortCategoriesForPanel(progress.categories, notice !== null)
  const itemsWithoutHours = getItemsWithoutHours(ruleItems, progress.categories)

  return (
    <AppFrame topBar={<TopBar variant="home" />} bottomNav={<MainNav />}>
      <S.Page>
        {notice ? (
          <Notice format="block" tone="success" title={notice.title}>
            {notice.body}
          </Notice>
        ) : null}

        <TotalProgress
          doneHours={progress.totalHours}
          goalHours={progress.targetHours}
          guideHref="/atividades/pedido"
          linkAs={NextLink}
        />

        <S.Section>
          <S.SectionTitle>Onde você já tem horas</S.SectionTitle>
          <S.CardList>
            {categories.map((category) => (
              <CategoryCard
                key={category.itemNumber}
                itemNumber={category.itemNumber}
                name={category.name}
                countedHours={category.countedHours}
                maxHours={category.maxHours}
                overflowHours={category.hoursOverLimit}
                href={`/atividades?item=${category.itemNumber}`}
                linkAs={NextLink}
              />
            ))}
          </S.CardList>
        </S.Section>

        {itemsWithoutHours.length > 0 ? (
          <Disclosure title="Outras atividades que contam" count={itemsWithoutHours.length}>
            {itemsWithoutHours.map((item) => (
              <Disclosure.Row
                key={item.itemNumber}
                itemNumber={item.itemNumber}
                name={item.name}
                rule={item.rule}
              />
            ))}
          </Disclosure>
        ) : null}
      </S.Page>
    </AppFrame>
  )
}

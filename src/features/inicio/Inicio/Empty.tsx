'use client'

import type { ReactNode } from 'react'

import { AppFrame, Disclosure, TopBar, TotalProgress } from '@design-system'

import { MainNav } from '@/components/MainNav'
import type { RuleItem } from '@/services/rules'

import { FirstSteps } from './_components/FirstSteps'
import * as S from './styles'

type EmptyProps = {
  /** Meta de horas do curso, vinda de `getProgress`. */
  targetHours: number
  /** Itens do formulário do curso. Todos entram em "Outras atividades que contam", porque nenhum tem horas. */
  ruleItems: RuleItem[]
}

/**
 * Início do primeiro acesso, quando o aluno ainda não registrou nenhuma atividade.
 *
 * @remarks
 * Mostra o total em 0h, o caminho até a meta e a lista de itens aberta, como orientação. Quem decide
 * entrar neste estado é o `Inicio`, quando `progress.categories` vem vazio.
 *
 * @example
 * ```tsx
 * if (progress.categories.length === 0) {
 *   return <Empty targetHours={progress.targetHours} ruleItems={ruleItems} />
 * }
 * ```
 */
export function Empty({ targetHours, ruleItems }: EmptyProps): ReactNode {
  return (
    <AppFrame topBar={<TopBar variant="home" />} bottomNav={<MainNav />}>
      <S.Page>
        <TotalProgress doneHours={0} goalHours={targetHours} />
        <FirstSteps targetHours={targetHours} />
        {ruleItems.length > 0 ? (
          <Disclosure title="Outras atividades que contam" count={ruleItems.length} defaultOpen>
            {ruleItems.map((item) => (
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

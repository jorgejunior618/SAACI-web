// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import type { ProgressCategory } from '@/services/progress'
import type { RuleItem } from '@/services/rules'

/** Texto do aviso que o painel mostra quando um item chegou ao máximo e a meta ainda não. */
export type LimitNotice = {
  /** Fato em poucas palavras, como "Você completou o item 13". */
  title: string
  /** O que ainda soma. `null` quando não sobra item nem atividade para indicar. */
  body: string | null
}

/**
 * Indica se o item chegou ao máximo de horas. É a mesma regra que vira o cartão `full`.
 *
 * @remarks
 * A regra mora também no `CategoryCard` (`@design-system`), que não pode importar daqui. Se ela
 * mudar lá, mude aqui no mesmo commit, ou o aviso de limite e o cartão passam a discordar.
 *
 * @param category Horas do item no total do aluno.
 * @returns `true` quando as horas que contam alcançaram o máximo do item.
 */
export function isCategoryFull(category: ProgressCategory): boolean {
  return category.countedHours >= category.maxHours
}

/**
 * Lista os itens da regra do curso em que o aluno ainda não tem horas.
 *
 * @remarks
 * Não soma horas: só compara números de item. O resultado alimenta a seção "Outras atividades que
 * contam" e a contagem do aviso de limite.
 *
 * @param ruleItems Itens do formulário do curso, na ordem do formulário.
 * @param categories Itens com horas, vindos do progresso.
 * @returns Os itens da regra que não aparecem em `categories`, na ordem original.
 */
export function getItemsWithoutHours(
  ruleItems: RuleItem[],
  categories: ProgressCategory[],
): RuleItem[] {
  const withHours = new Set(categories.map((category) => category.itemNumber))

  return ruleItems.filter((item) => !withHours.has(item.itemNumber))
}

/**
 * Filtra os itens que já chegaram ao máximo.
 *
 * @param categories Itens com horas, vindos do progresso.
 * @returns Só os itens cheios, na ordem recebida.
 */
export function getFullCategories(categories: ProgressCategory[]): ProgressCategory[] {
  return categories.filter(isCategoryFull)
}

/**
 * Ordena os cartões do painel.
 *
 * @remarks
 * Com `isFullFirst`, os itens cheios sobem para o topo, que é o que o aviso de limite anuncia. Sem ele,
 * a ordem do formulário se mantém. Em ambos os casos a ordem relativa dentro de cada grupo não muda.
 *
 * @param categories Itens com horas, na ordem do formulário.
 * @param isFullFirst Sobe os itens cheios para o começo da lista.
 * @returns Uma cópia ordenada. A lista recebida não é alterada.
 */
export function sortCategoriesForPanel(
  categories: ProgressCategory[],
  isFullFirst: boolean,
): ProgressCategory[] {
  if (!isFullFirst) return [...categories]

  return [...getFullCategories(categories), ...categories.filter((c) => !isCategoryFull(c))]
}

/**
 * Escreve uma lista de números de item em português ("6", "6 e 7", "6, 7 e 12").
 *
 * @param numbers Números de item, já na ordem em que devem aparecer.
 * @returns O texto da lista. Vazio quando a lista é vazia.
 */
export function formatItemList(numbers: number[]): string {
  if (numbers.length <= 1) return numbers.join('')

  return `${numbers.slice(0, -1).join(', ')} e ${numbers[numbers.length - 1]}`
}

/**
 * Monta o aviso do painel para quando há item cheio e a meta ainda não foi cumprida.
 *
 * @remarks
 * Quem decide se a meta foi cumprida é a tela. Este cálculo só descreve os itens: os cheios no título
 * e, no corpo, os itens com horas que ainda cabem mais e quantas atividades da regra o aluno ainda
 * não usou.
 *
 * @param categories Itens com horas, vindos do progresso.
 * @param ruleItems Itens do formulário do curso.
 * @returns O aviso, ou `null` quando nenhum item está cheio.
 *
 * @example
 * ```ts
 * formatLimitNotice(progress.categories, ruleItems)
 * // { title: 'Você completou o item 13', body: 'Ainda dá para somar nos itens 6, 7 e 12 e em outras 20 atividades.' }
 * ```
 */
export function formatLimitNotice(
  categories: ProgressCategory[],
  ruleItems: RuleItem[],
): LimitNotice | null {
  const full = getFullCategories(categories)

  if (full.length === 0) return null

  const fullNumbers = full.map((category) => category.itemNumber)
  const title = `Você completou ${fullNumbers.length === 1 ? 'o item' : 'os itens'} ${formatItemList(fullNumbers)}`

  const openNumbers = categories.filter((c) => !isCategoryFull(c)).map((c) => c.itemNumber)
  const othersCount = getItemsWithoutHours(ruleItems, categories).length

  const parts: string[] = []

  if (openNumbers.length > 0) {
    parts.push(
      `${openNumbers.length === 1 ? 'no item' : 'nos itens'} ${formatItemList(openNumbers)}`,
    )
  }

  if (othersCount > 0) {
    parts.push(`em ${othersCount === 1 ? 'outra atividade' : `outras ${othersCount} atividades`}`)
  }

  return {
    title,
    body: parts.length > 0 ? `Ainda dá para somar ${parts.join(' e ')}.` : null,
  }
}

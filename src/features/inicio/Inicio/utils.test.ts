// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import { describe, expect, it } from 'vitest'

import type { ProgressCategory } from '@/services/progress'
import type { RuleItem } from '@/services/rules'

import {
  formatItemList,
  formatLimitNotice,
  getFullCategories,
  getItemsWithoutHours,
  sortCategoriesForPanel,
} from './utils'

function category(itemNumber: number, countedHours: number, maxHours: number): ProgressCategory {
  return { itemNumber, name: `Item ${itemNumber}`, countedHours, maxHours, hoursOverLimit: 0 }
}

function ruleItem(itemNumber: number): RuleItem {
  return {
    itemNumber,
    name: `Item ${itemNumber}`,
    rule: '',
    ratio: { hours: 1, per: 1, unit: 'hora' },
    maxHours: 40,
  }
}

describe('formatItemList', () => {
  it('escreve a lista em português', () => {
    expect(formatItemList([])).toBe('')
    expect(formatItemList([6])).toBe('6')
    expect(formatItemList([6, 7])).toBe('6 e 7')
    expect(formatItemList([6, 7, 12])).toBe('6, 7 e 12')
  })
})

describe('getItemsWithoutHours', () => {
  it('devolve só os itens da regra que não têm horas, na ordem da regra', () => {
    const items = [1, 2, 3, 4].map(ruleItem)

    expect(getItemsWithoutHours(items, [category(2, 5, 40), category(4, 5, 40)])).toEqual([
      ruleItem(1),
      ruleItem(3),
    ])
  })
})

describe('getFullCategories', () => {
  it('considera cheio o item que chegou ao máximo', () => {
    const categories = [category(1, 40, 80), category(7, 60, 60), category(13, 30, 30)]

    expect(getFullCategories(categories).map((c) => c.itemNumber)).toEqual([7, 13])
  })
})

describe('sortCategoriesForPanel', () => {
  const categories = [category(6, 15, 60), category(7, 18, 60), category(13, 30, 30)]

  it('mantém a ordem do formulário sem isFullFirst', () => {
    expect(sortCategoriesForPanel(categories, false).map((c) => c.itemNumber)).toEqual([6, 7, 13])
  })

  it('sobe os itens cheios com isFullFirst, sem mexer na lista recebida', () => {
    expect(sortCategoriesForPanel(categories, true).map((c) => c.itemNumber)).toEqual([13, 6, 7])
    expect(categories.map((c) => c.itemNumber)).toEqual([6, 7, 13])
  })
})

describe('formatLimitNotice', () => {
  const ruleItems = Array.from({ length: 24 }, (_, index) => ruleItem(index + 1))

  it('devolve null sem item cheio', () => {
    expect(formatLimitNotice([category(6, 15, 60)], ruleItems)).toBeNull()
  })

  it('cita o item cheio, os itens abertos e as outras atividades', () => {
    const categories = [
      category(6, 15, 60),
      category(7, 18, 60),
      category(12, 16, 40),
      category(13, 30, 30),
    ]

    expect(formatLimitNotice(categories, ruleItems)).toEqual({
      title: 'Você completou o item 13',
      body: 'Ainda dá para somar nos itens 6, 7 e 12 e em outras 20 atividades.',
    })
  })

  it('usa o plural quando há mais de um item cheio', () => {
    const categories = [category(7, 60, 60), category(13, 30, 30)]

    expect(formatLimitNotice(categories, ruleItems)?.title).toBe('Você completou os itens 7 e 13')
  })

  it('usa o singular para uma atividade restante e omite o que não existe', () => {
    const categories = [category(1, 40, 40), category(2, 5, 40)]

    expect(formatLimitNotice(categories, [ruleItem(1), ruleItem(2), ruleItem(3)])?.body).toBe(
      'Ainda dá para somar no item 2 e em outra atividade.',
    )
  })

  it('deixa o corpo nulo quando não sobra o que indicar', () => {
    expect(formatLimitNotice([category(1, 40, 40)], [ruleItem(1)])?.body).toBeNull()
  })
})

import { describe, expect, it } from 'vitest'

import type { Activity } from '@/services/activities'
import type { ProgressCategory } from '@/services/progress'
import type { RuleItem } from '@/services/rules'

import { formatProofsSummary, formatReason, groupActivitiesByItem, parseItemParam } from './utils'

let seq = 0

function activity(over: Partial<Activity>): Activity {
  seq += 1
  return {
    id: `00000000-0000-4000-8000-${String(seq).padStart(12, '0')}`,
    name: `Atividade ${seq}`,
    itemNumber: 6,
    quantity: 4,
    startDate: '2025-01-01',
    endDate: '2025-01-02',
    registeredAt: '2025-01-02T12:00:00.000Z',
    updatedAt: '2025-01-02T12:00:00.000Z',
    activityHours: 1,
    countedHours: 1,
    status: 'conta',
    reason: null,
    proof: { fileName: `comprovante-${seq}.pdf`, sizeBytes: 1_000, type: 'pdf' },
    ...over,
  }
}

function ruleItem(itemNumber: number, maxHours = 60): RuleItem {
  return {
    itemNumber,
    name: `Item ${itemNumber}`,
    rule: '',
    ratio: { hours: 1, per: 4, unit: 'hora' },
    maxHours,
  }
}

function category(itemNumber: number, countedHours: number): ProgressCategory {
  return { itemNumber, name: `Item ${itemNumber}`, countedHours, maxHours: 60, hoursOverLimit: 0 }
}

describe('parseItemParam', () => {
  it('lê o número do item', () => {
    expect(parseItemParam('7')).toBe(7)
    expect(parseItemParam(['12', '6'])).toBe(12)
  })

  it('ignora valor ausente ou que não é item', () => {
    expect(parseItemParam(undefined)).toBeNull()
    expect(parseItemParam('')).toBeNull()
    expect(parseItemParam('abc')).toBeNull()
    expect(parseItemParam('0')).toBeNull()
    expect(parseItemParam('1.5')).toBeNull()
  })
})

describe('groupActivitiesByItem', () => {
  it('agrupa na ordem do formulário, com as horas do progresso', () => {
    const a = activity({ itemNumber: 13 })
    const b = activity({ itemNumber: 6 })
    const c = activity({ itemNumber: 6 })

    const groups = groupActivitiesByItem(
      [b, c, a],
      [ruleItem(6), ruleItem(7), ruleItem(13, 30)],
      [category(6, 15), category(13, 2)],
    )

    expect(groups.map((g) => [g.itemNumber, g.countedHours, g.maxHours])).toEqual([
      [6, 15, 60],
      [13, 2, 30],
    ])
    expect(groups[0]?.activities).toEqual([b, c])
  })

  it('mostra com 0h o item em que nenhuma atividade conta', () => {
    const old = activity({ itemNumber: 13, countedHours: 0, status: 'nao_conta' })

    const [group] = groupActivitiesByItem([old], [ruleItem(13, 30)], [])

    expect(group).toMatchObject({ itemNumber: 13, countedHours: 0, activities: [old] })
  })
})

describe('formatProofsSummary', () => {
  it('conta os comprovantes que contam e os itens deles', () => {
    const list = [
      activity({ itemNumber: 6 }),
      activity({ itemNumber: 7 }),
      activity({ itemNumber: 7, status: 'parcial' }),
    ]

    expect(formatProofsSummary(list)).toBe('3 comprovantes contam, em 2 itens.')
  })

  it('cita os que não contam', () => {
    const list = [
      activity({ itemNumber: 6 }),
      activity({ itemNumber: 13, status: 'nao_conta' }),
      activity({ itemNumber: 13, status: 'nao_conta' }),
    ]

    expect(formatProofsSummary(list)).toBe('1 comprovante conta, em 1 item. 2 não contam.')
  })

  it('avisa quando nenhum conta', () => {
    expect(formatProofsSummary([activity({ status: 'nao_conta' })])).toBe(
      'Nenhum comprovante conta ainda. 1 não conta.',
    )
  })
})

describe('formatReason', () => {
  it('traduz o motivo para o aluno', () => {
    expect(formatReason('antes_do_ingresso')).toBe('antes do seu ingresso')
    expect(formatReason('item_cheio')).toBe('item já no máximo')
  })
})

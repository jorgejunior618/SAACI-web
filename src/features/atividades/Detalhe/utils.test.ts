import { describe, expect, it } from 'vitest'

import type { Activity } from '@/services/activities'
import type { RuleItem } from '@/services/rules'

import {
  activityToForm,
  describeRemoval,
  describeWhy,
  formatRegisteredDate,
  getCalcRows,
  getCorrection,
  getPreviousHints,
  getRoomHours,
  getStatusBadge,
  getTotalAfterRemoval,
} from './utils'

const COURSE: RuleItem = {
  itemNumber: 7,
  name: 'Curso na área de engenharia de computação',
  rule: '1h a cada 4h de curso, até 60h',
  ratio: { hours: 1, per: 4, unit: 'hora' },
  maxHours: 60,
}

const TALK: RuleItem = {
  itemNumber: 13,
  name: 'Palestra como ouvinte',
  rule: '2h por palestra, até 30h',
  ratio: { hours: 2, per: 1, unit: 'palestra' },
  maxHours: 30,
}

function activity(over: Partial<Activity>): Activity {
  return {
    id: '00000000-0000-4000-8000-000000000001',
    name: 'Curso de React com TypeScript',
    itemNumber: 7,
    quantity: 40,
    startDate: '2026-08-03',
    endDate: '2026-09-12',
    registeredAt: '2026-10-31T12:00:00.000Z',
    updatedAt: '2026-10-31T12:00:00.000Z',
    activityHours: 10,
    countedHours: 10,
    status: 'conta',
    reason: null,
    proof: { fileName: 'certificado.pdf', sizeBytes: 1000, type: 'pdf' },
    ...over,
  }
}

describe('getStatusBadge', () => {
  it('traduz o status para o tom e o texto do Badge', () => {
    expect(getStatusBadge('conta')).toEqual({ tone: 'counts', label: 'Conta' })
    expect(getStatusBadge('parcial')).toEqual({ tone: 'partial', label: 'Conta em parte' })
    expect(getStatusBadge('nao_conta')).toEqual({ tone: 'doesNotCount', label: 'Não conta' })
  })
})

describe('getRoomHours', () => {
  it('desconta só as atividades do mesmo item registradas antes', () => {
    const current = activity({})
    const earlier = activity({
      id: '00000000-0000-4000-8000-000000000002',
      registeredAt: '2026-05-01T12:00:00.000Z',
      countedHours: 18,
    })
    const later = activity({
      id: '00000000-0000-4000-8000-000000000003',
      registeredAt: '2026-11-01T12:00:00.000Z',
      countedHours: 20,
    })
    const otherItem = activity({
      id: '00000000-0000-4000-8000-000000000004',
      itemNumber: 13,
      registeredAt: '2026-01-01T12:00:00.000Z',
      countedHours: 6,
    })

    expect(getRoomHours(current, [earlier, current, later, otherItem], 60)).toBe(42)
  })

  it('nunca devolve negativo', () => {
    const current = activity({})
    const earlier = activity({
      id: '00000000-0000-4000-8000-000000000002',
      registeredAt: '2026-05-01T12:00:00.000Z',
      countedHours: 70,
    })

    expect(getRoomHours(current, [earlier, current], 60)).toBe(0)
  })
})

describe('getCalcRows', () => {
  it('mostra a conta da razão e o que cabia no item', () => {
    expect(getCalcRows(activity({}), COURSE, 42)).toEqual([
      { label: '40h ÷ 4', value: 10 },
      { label: 'Cabiam no item 7', value: 42 },
    ])
  })

  it('usa o singular quando cabia 1h', () => {
    const talk = activity({ itemNumber: 13, quantity: 1, activityHours: 2, countedHours: 1 })

    expect(getCalcRows(talk, TALK, 1)[1]).toEqual({ label: 'Cabia no item 13', value: 1 })
  })

  it('troca o espaço do item pelo ingresso quando começou antes dele', () => {
    const before = activity({ countedHours: 0, status: 'nao_conta', reason: 'antes_do_ingresso' })

    expect(getCalcRows(before, COURSE, 42)[1]).toEqual({ label: 'Antes do ingresso', value: 0 })
  })
})

describe('describeWhy', () => {
  it('conta inteira', () => {
    expect(describeWhy(activity({}), COURSE, '2023-07-01')).toBe(
      'Conta inteira: o item 7 ainda tinha espaço para ela.',
    )
  })

  it('conta em parte, com o que ficou de fora', () => {
    const partial = activity({
      itemNumber: 13,
      quantity: 1,
      activityHours: 2,
      countedHours: 1,
      status: 'parcial',
    })

    expect(describeWhy(partial, TALK, '2023-07-01')).toBe(
      'Ficou 1,0h de fora porque o item 13 chegou ao limite de 30h. As atividades registradas antes contam primeiro.',
    )
  })

  it('não conta porque o item está cheio', () => {
    const full = activity({ countedHours: 0, status: 'nao_conta', reason: 'item_cheio' })

    expect(describeWhy(full, COURSE, '2023-07-01')).toBe(
      'Não conta porque o item 7 chegou ao limite de 60h. As atividades registradas antes contam primeiro.',
    )
  })

  it('não conta porque começou antes do ingresso', () => {
    const before = activity({
      startDate: '2023-02-10',
      countedHours: 0,
      status: 'nao_conta',
      reason: 'antes_do_ingresso',
    })

    expect(describeWhy(before, COURSE, '2023-07-01')).toBe(
      'Não conta porque começou em 10/02/2023, antes do seu ingresso em 2023.2. Só valem atividades feitas depois do ingresso.',
    )
  })
})

describe('describeRemoval', () => {
  it('diz de quanto para quanto o total vai', () => {
    expect(describeRemoval('Curso de React com TypeScript', 69, 59)).toBe(
      'Curso de React com TypeScript sai do seu total, que volta de 69h para 59h. O comprovante também é apagado e isso não dá para desfazer.',
    )
  })

  it('diz que o total continua igual quando ele não muda', () => {
    expect(describeRemoval('Curso de React com TypeScript', 69, 69)).toBe(
      'Curso de React com TypeScript sai da lista, e seu total continua em 69h. O comprovante também é apagado e isso não dá para desfazer.',
    )
  })
})

describe('getTotalAfterRemoval', () => {
  const INGRESSO = '2023-07-01'

  function removal(removed: Activity, others: Activity[], targetHours = 120): number {
    return getTotalAfterRemoval({
      activity: removed,
      activities: [...others, removed],
      ruleItems: [COURSE, TALK],
      startSemester: INGRESSO,
      targetHours,
    })
  }

  it('não cai abaixo da meta quando a soma passa dela', () => {
    // 40h no item 7 + 10h no item 13 = 50h, mas a meta é 20h. Sem as 10h, a soma (40h) ainda passa.
    const course = activity({ id: 'a1', quantity: 160, countedHours: 40 })
    const talks = activity({ id: 'a2', itemNumber: 13, quantity: 5, countedHours: 10 })

    expect(removal(talks, [course], 20)).toBe(20)
  })

  it('segue o truncamento em horas inteiras do total', () => {
    // 59h + 0,5h = 59,5h, que o total mostra como 59h. Sem a de 0,5h, continua 59h.
    const course = activity({ id: 'a1', quantity: 236, countedHours: 59 })
    const short = activity({ id: 'a2', quantity: 2, activityHours: 0.5, countedHours: 0.5 })

    expect(removal(short, [course])).toBe(59)
  })

  it('devolve ao total a atividade que estava fora por falta de espaço no item', () => {
    // A primeira enche as 30h do item 13; a segunda (10h) não conta. Sem a primeira, a segunda conta.
    const first = activity({
      id: 'a1',
      itemNumber: 13,
      quantity: 15,
      registeredAt: '2026-01-01T12:00:00.000Z',
      countedHours: 30,
    })
    const second = activity({
      id: 'a2',
      itemNumber: 13,
      quantity: 5,
      registeredAt: '2026-02-01T12:00:00.000Z',
      countedHours: 0,
      status: 'nao_conta',
      reason: 'item_cheio',
    })

    expect(removal(first, [second])).toBe(10)
  })
})

describe('formatRegisteredDate', () => {
  it('usa o dia no fuso do IFCE, não o de UTC', () => {
    // 02h de 1º/11 em UTC ainda é 31/10 em Fortaleza (UTC-3).
    expect(formatRegisteredDate('2026-11-01T02:00:00.000Z')).toBe('31/10/2026')
  })
})

describe('activityToForm', () => {
  it('escreve a atividade como a pessoa digitaria', () => {
    expect(activityToForm(activity({ quantity: 2.5 }))).toEqual({
      name: 'Curso de React com TypeScript',
      quantity: '2,5',
      startDate: '03/08/2026',
      endDate: '12/09/2026',
    })
  })
})

describe('getPreviousHints', () => {
  it('mostra o antes só nos campos alterados, sem contar espaços', () => {
    const before = activityToForm(activity({}))

    expect(
      getPreviousHints(before, { ...before, quantity: '300', name: ` ${before.name} ` }),
    ).toEqual({ quantity: 'Antes: 40' })
  })
})

describe('getCorrection', () => {
  const values = {
    name: 'Curso de React com TypeScript',
    quantity: 40,
    startDate: '2026-08-03',
    endDate: '2026-09-12',
  }

  it('fica vazio quando nada mudou', () => {
    expect(getCorrection(activity({}), values, 7)).toEqual({})
  })

  it('leva só o que mudou, inclusive o item', () => {
    expect(getCorrection(activity({}), { ...values, quantity: 300 }, 13)).toEqual({
      quantity: 300,
      itemNumber: 13,
    })
  })
})

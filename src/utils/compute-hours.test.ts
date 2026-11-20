import { describe, expect, it } from 'vitest'

import { compareByRegistration, computeActivities, computeProgress } from './compute-hours'
import type { HoursActivityInput, HoursRuleInput } from './compute-hours'

const RULES: HoursRuleInput[] = [
  {
    itemNumber: 6,
    name: 'Curso de línguas',
    ratio: { hours: 1, per: 4, unit: 'hora' },
    maxHours: 60,
  },
  { itemNumber: 13, name: 'Ouvinte', ratio: { hours: 2, per: 1, unit: 'palestra' }, maxHours: 30 },
  { itemNumber: 16, name: 'Relatório', ratio: { hours: 3, per: 10, unit: 'pagina' }, maxHours: 30 },
  {
    itemNumber: 18,
    name: 'Pôster',
    ratio: { hours: 5, per: 1, unit: 'publicacao' },
    maxHours: 40,
  },
]

const INGRESSO = '2023-07-01'

let seq = 0

function activity(over: Partial<HoursActivityInput>): HoursActivityInput {
  seq += 1
  return {
    id: `a${seq}`,
    itemNumber: 6,
    quantity: 60,
    startDate: '2024-03-01',
    registeredAt: `2024-01-01T00:00:${String(seq).padStart(2, '0')}.000Z`,
    ...over,
  }
}

describe('compareByRegistration', () => {
  const at = (id: string, registeredAt: string) => ({ id, registeredAt })

  it('põe primeiro quem foi registrado antes', () => {
    expect(
      compareByRegistration(
        at('b', '2025-01-01T12:00:00.000Z'),
        at('a', '2025-02-01T12:00:00.000Z'),
      ),
    ).toBeLessThan(0)
  })

  it('desempata pelo id quando o registro é o mesmo', () => {
    const same = '2025-01-01T12:00:00.000Z'

    expect(compareByRegistration(at('a', same), at('b', same))).toBeLessThan(0)
    expect(compareByRegistration(at('b', same), at('a', same))).toBeGreaterThan(0)
    expect(compareByRegistration(at('a', same), at('a', same))).toBe(0)
  })
})

describe('computeActivities', () => {
  it('converte a quantidade pela razão do item', () => {
    expect(computeActivities([activity({ quantity: 60 })], RULES, INGRESSO)).toEqual([
      {
        id: expect.any(String),
        activityHours: 15,
        countedHours: 15,
        status: 'conta',
        reason: null,
      },
    ])
  })

  it('trunca em uma casa decimal, sem arredondar para cima (RF14)', () => {
    const [a, b] = computeActivities(
      [activity({ quantity: 7 }), activity({ quantity: 1.9 })],
      RULES,
      INGRESSO,
    )

    expect(a?.countedHours).toBe(1.7) // 7 / 4 = 1,75
    expect(b?.countedHours).toBe(0.4) // 1,9 / 4 = 0,475
  })

  it('não perde um décimo pelo ponto flutuante', () => {
    // fator 0,94 × 5h = 4,7h, mas 0.94 * 5 * 10 em ponto flutuante dá 46,999…, que truncado seria 4,6
    const [a] = computeActivities([activity({ itemNumber: 18, quantity: 0.94 })], RULES, INGRESSO)

    expect(a?.countedHours).toBe(4.7)
  })

  it('conta a atividade que começa no dia do ingresso e recusa a anterior (RF38)', () => {
    const [onTheDay, before] = computeActivities(
      [activity({ startDate: '2023-07-01' }), activity({ startDate: '2023-06-30' })],
      RULES,
      INGRESSO,
    )

    expect(onTheDay).toMatchObject({ status: 'conta', countedHours: 15 })
    expect(before).toMatchObject({
      status: 'nao_conta',
      countedHours: 0,
      reason: 'antes_do_ingresso',
    })
  })

  it('não conta nada sem semestre de ingresso', () => {
    const [a] = computeActivities([activity({})], RULES, null)

    expect(a).toMatchObject({ countedHours: 0, reason: 'antes_do_ingresso' })
  })

  it('divide o máximo pela ordem de registro (RF16)', () => {
    // item 13: 2h por palestra, até 30h. 10 + 10 = 20h; a terceira pede 12h e só cabem 10h.
    const first = activity({
      itemNumber: 13,
      quantity: 5,
      registeredAt: '2024-01-01T00:00:00.000Z',
    })
    const second = activity({
      itemNumber: 13,
      quantity: 5,
      registeredAt: '2024-02-01T00:00:00.000Z',
    })
    const third = activity({
      itemNumber: 13,
      quantity: 6,
      registeredAt: '2024-03-01T00:00:00.000Z',
    })
    const fourth = activity({
      itemNumber: 13,
      quantity: 1,
      registeredAt: '2024-04-01T00:00:00.000Z',
    })

    // a ordem de entrada não importa, só a de registro
    const result = computeActivities([fourth, third, second, first], RULES, INGRESSO)

    expect(result.map((r) => [r.id, r.countedHours, r.status, r.reason])).toEqual([
      [fourth.id, 0, 'nao_conta', 'item_cheio'],
      [third.id, 10, 'parcial', 'item_cheio'],
      [second.id, 10, 'conta', null],
      [first.id, 10, 'conta', null],
    ])
  })

  it('devolve as horas da atividade antes do máximo e do ingresso', () => {
    // item 13: 2h por palestra, até 30h. 14 palestras = 28h; a segunda pede 6h e só cabem 2h.
    const [full, partial, old] = computeActivities(
      [
        activity({ itemNumber: 13, quantity: 14, registeredAt: '2024-01-01T00:00:00.000Z' }),
        activity({ itemNumber: 13, quantity: 3, registeredAt: '2024-02-01T00:00:00.000Z' }),
        activity({ itemNumber: 13, quantity: 1, startDate: '2022-01-01' }),
      ],
      RULES,
      INGRESSO,
    )

    expect(full).toMatchObject({ activityHours: 28, countedHours: 28 })
    expect(partial).toMatchObject({ activityHours: 6, countedHours: 2, status: 'parcial' })
    expect(old).toMatchObject({ activityHours: 2, countedHours: 0, status: 'nao_conta' })
  })

  it('a atividade anterior ao ingresso não ocupa o máximo', () => {
    const old = activity({ itemNumber: 13, quantity: 15, startDate: '2022-01-01' })
    const recent = activity({ itemNumber: 13, quantity: 15 })

    expect(computeActivities([old, recent], RULES, INGRESSO)[1]).toMatchObject({
      countedHours: 30,
      status: 'conta',
    })
  })

  it('recusa atividade de item que não existe nas regras', () => {
    expect(() => computeActivities([activity({ itemNumber: 99 })], RULES, INGRESSO)).toThrow(
      /item 99/,
    )
  })
})

describe('computeProgress', () => {
  it('soma os itens, trunca o total em horas inteiras e calcula o que falta', () => {
    const progress = computeProgress({
      activities: [activity({ quantity: 7 }), activity({ itemNumber: 13, quantity: 3 })],
      ruleItems: RULES,
      startSemester: INGRESSO,
      targetHours: 120,
    })

    expect(progress).toEqual({
      totalHours: 7, // 1,7 + 6 = 7,7
      targetHours: 120,
      missingHours: 113,
      itemsSum: 7.7,
      categories: [
        {
          itemNumber: 6,
          name: 'Curso de línguas',
          countedHours: 1.7,
          maxHours: 60,
          hoursOverLimit: 0,
        },
        { itemNumber: 13, name: 'Ouvinte', countedHours: 6, maxHours: 30, hoursOverLimit: 0 },
      ],
    })
  })

  it('registra o excesso do item e limita o total à meta', () => {
    const progress = computeProgress({
      activities: [activity({ quantity: 400 }), activity({ itemNumber: 13, quantity: 20 })],
      ruleItems: RULES,
      startSemester: INGRESSO,
      targetHours: 80,
    })

    expect(
      progress.categories.map((c) => [c.itemNumber, c.countedHours, c.hoursOverLimit]),
    ).toEqual([
      [6, 60, 40],
      [13, 30, 10],
    ])
    expect(progress).toMatchObject({ itemsSum: 90, totalHours: 80, missingHours: 0 })
  })

  it('deixa de fora o item em que nada conta', () => {
    const progress = computeProgress({
      activities: [activity({ startDate: '2020-01-01' })],
      ruleItems: RULES,
      startSemester: INGRESSO,
      targetHours: 120,
    })

    expect(progress).toMatchObject({
      totalHours: 0,
      missingHours: 120,
      itemsSum: 0,
      categories: [],
    })
  })
})

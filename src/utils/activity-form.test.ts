// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import * as v from 'valibot'
import { describe, expect, it } from 'vitest'

import { END_BEFORE_START_MESSAGE } from '@/services/activities'
import type { RuleItem } from '@/services/rules'

import {
  ActivityFormSchema,
  buildPreview,
  describeCalc,
  describeQuantity,
  getQuantityText,
  parseQuantity,
} from './activity-form'
import type { ActivityFormInput, PreviewInput } from './activity-form'
import type { HoursActivityInput } from './compute-hours'

const RULES: RuleItem[] = [
  {
    itemNumber: 7,
    name: 'Curso na área de engenharia de computação',
    rule: '1h a cada 4h de curso, até 60h',
    ratio: { hours: 1, per: 4, unit: 'hora' },
    maxHours: 60,
  },
  {
    itemNumber: 13,
    name: 'Ouvinte em palestras da área do curso',
    rule: '2h por palestra, até 30h',
    ratio: { hours: 2, per: 1, unit: 'palestra' },
    maxHours: 30,
  },
]

const INGRESSO = '2023-07-01'

function activity(over: Partial<HoursActivityInput>): HoursActivityInput {
  return {
    id: 'a1',
    itemNumber: 13,
    quantity: 13,
    startDate: '2024-03-01',
    registeredAt: '2024-03-02T12:00:00.000Z',
    ...over,
  }
}

function input(over: Partial<PreviewInput>): PreviewInput {
  return {
    activities: [],
    ruleItems: RULES,
    startSemester: INGRESSO,
    itemNumber: 7,
    quantity: 40,
    startDate: '2026-08-03',
    ...over,
  }
}

describe('buildPreview', () => {
  it('conta a atividade inteira quando cabe no item', () => {
    const preview = buildPreview(input({}))

    expect(preview.willCount).toBe(10)
    expect(preview.calcRows).toEqual([
      { label: '40h ÷ 4', value: 10 },
      { label: 'Cabem neste item', value: 60 },
    ])
    expect(preview.warning).toBeUndefined()
  })

  it('conta só o que cabe e avisa quando o item está perto do limite', () => {
    // 13 palestras × 2h = 26h já usadas de 30h; 3 palestras valem 6h, só 4h cabem.
    const preview = buildPreview(
      input({
        activities: [activity({})],
        itemNumber: 13,
        quantity: 3,
      }),
    )

    expect(preview.usedHours).toBe(26)
    expect(preview.calcRows[0]).toEqual({ label: '3 palestras × 2,0h', value: 6 })
    expect(preview.willCount).toBe(4)
    expect(preview.hours?.status).toBe('parcial')
    expect(preview.warning).toBe('Essa atividade vale 6,0h, mas só cabem mais 4,0h neste item.')
  })

  it('não conta nada e avisa quando o item já está cheio', () => {
    const preview = buildPreview(
      input({
        activities: [activity({ quantity: 15 })],
        itemNumber: 13,
        quantity: 3,
      }),
    )

    expect(preview.willCount).toBe(0)
    expect(preview.hours?.status).toBe('nao_conta')
    expect(preview.warning).toBe(
      'O item 13 já chegou ao limite de 30h. A atividade fica guardada, mas não soma horas.',
    )
  })

  it('não conta nada e avisa quando começou antes do ingresso', () => {
    const preview = buildPreview(input({ startDate: '2022-02-01' }))

    expect(preview.willCount).toBe(0)
    expect(preview.hours?.reason).toBe('antes_do_ingresso')
    expect(preview.warning).toBe(
      'A atividade começou antes do seu semestre de ingresso. Ela fica guardada, mas não soma horas.',
    )
  })

  it('não desconta do espaço a atividade do item que começou antes do ingresso', () => {
    const preview = buildPreview(
      input({
        activities: [
          activity({ id: 'antiga', quantity: 10, startDate: '2022-02-01' }),
          activity({ id: 'conta', quantity: 5 }),
        ],
        itemNumber: 13,
        quantity: 3,
      }),
    )

    expect(preview.usedHours).toBe(10)
    expect(preview.calcRows[1]).toEqual({ label: 'Cabem neste item', value: 20 })
    expect(preview.willCount).toBe(6)
  })

  it('desconta só o item escolhido, e não as atividades de outros itens', () => {
    const preview = buildPreview(
      input({ activities: [activity({ quantity: 15 })], itemNumber: 7, quantity: 40 }),
    )

    expect(preview.usedHours).toBe(0)
    expect(preview.willCount).toBe(10)
  })

  it('soma o espaço usado em décimos, sem erro de ponto flutuante', () => {
    // Três cursos de 0,4h valem 0,1h cada. Em ponto flutuante, 0,1 + 0,1 + 0,1 dá 0,30000000000000004.
    const tiny = ['p1', 'p2', 'p3'].map((id) => activity({ id, itemNumber: 7, quantity: 0.4 }))
    const preview = buildPreview(input({ activities: tiny, quantity: null }))

    expect(preview.usedHours).toBe(0.3)
    expect(preview.calcRows).toEqual([{ label: 'Cabem neste item', value: 59.7 }])
  })

  it('mostra só quanto cabe enquanto a quantidade não é um número', () => {
    // 72h de curso ÷ 4 = 18h já usadas de 60h no item 7.
    const preview = buildPreview(
      input({ activities: [activity({ itemNumber: 7, quantity: 72 })], quantity: null }),
    )

    expect(preview.willCount).toBeNull()
    expect(preview.calcRows).toEqual([{ label: 'Cabem neste item', value: 42 }])
    expect(preview.warning).toBe('Digite a quantidade para ver quanto a atividade vai contar.')
  })

  it('supõe que conta pelo ingresso enquanto a data de início não está completa', () => {
    expect(buildPreview(input({ startDate: null })).willCount).toBe(10)
  })

  describe('na correção', () => {
    const corrected = activity({ id: 'a1', quantity: 13 })

    it('não conta a atividade corrigida duas vezes', () => {
      // Sozinha no item, ela ocupa 26h. Corrigida para 3 palestras, vale 6h e cabe inteira.
      const preview = buildPreview(
        input({
          activities: [corrected],
          itemNumber: 13,
          quantity: 3,
          replacing: corrected,
        }),
      )

      expect(preview.usedHours).toBe(0)
      expect(preview.willCount).toBe(6)
      expect(preview.calcRows[1]).toEqual({ label: 'Cabem neste item', value: 30 })
      expect(preview.warning).toBeUndefined()
    })

    it('desconta só quem foi registrado antes, porque ocupa o máximo primeiro', () => {
      // a0 (antes) usa 10h; a2 (depois) usaria o resto. A corrigida passa na frente de a2.
      const earlier = activity({ id: 'a0', quantity: 5, registeredAt: '2024-01-01T12:00:00.000Z' })
      const later = activity({ id: 'a2', quantity: 10, registeredAt: '2024-05-01T12:00:00.000Z' })
      const preview = buildPreview(
        input({
          activities: [earlier, corrected, later],
          itemNumber: 13,
          quantity: 12,
          replacing: corrected,
        }),
      )

      expect(preview.usedHours).toBe(10)
      expect(preview.calcRows[1]).toEqual({ label: 'Cabem neste item', value: 20 })
      expect(preview.willCount).toBe(20)
      expect(preview.hours?.status).toBe('parcial')
    })

    it('ao trocar de item, mede o espaço do item novo', () => {
      const other = activity({
        id: 'a3',
        itemNumber: 7,
        quantity: 72,
        registeredAt: '2024-01-01T12:00:00.000Z',
      })
      const preview = buildPreview(
        input({
          activities: [other, corrected],
          itemNumber: 7,
          quantity: 300,
          replacing: corrected,
        }),
      )

      expect(preview.usedHours).toBe(18)
      expect(preview.willCount).toBe(42)
      expect(preview.warning).toBe('Essa atividade vale 75,0h, mas só cabem mais 42,0h neste item.')
    })
  })
})

describe('describeCalc', () => {
  it('escreve a conta da razão sem o resultado', () => {
    expect(describeCalc(40, { hours: 1, per: 4, unit: 'hora' })).toBe('40h ÷ 4')
    expect(describeCalc(1, { hours: 2, per: 1, unit: 'palestra' })).toBe('1 palestra × 2,0h')
  })
})

describe('describeQuantity', () => {
  it('usa o rótulo da unidade e põe "h" só nas horas', () => {
    expect(describeQuantity(40, 'hora')).toEqual({ label: 'Horas do certificado', value: '40h' })
    expect(describeQuantity(1, 'palestra')).toEqual({ label: 'Palestras', value: '1' })
  })
})

describe('parseQuantity', () => {
  it.each([
    ['40', 40],
    ['2,5', 2.5],
    [' 3 ', 3],
    ['2.5', 2.5],
    ['10.25', 10.25],
    ['0.500', 0.5],
    ['1000', 1000],
  ])('lê "%s" como %d', (text, expected) => {
    expect(parseQuantity(text)).toBe(expected)
  })

  it.each(['', 'quarenta', '4,0,1', '-2', '1.000,5'])('recusa "%s"', (text) => {
    expect(parseQuantity(text)).toBeNull()
  })

  it.each(['1.000', '1.500', '12.345', '1.000.000'])('recusa "%s", que parece milhar', (text) => {
    expect(parseQuantity(text)).toBeNull()
  })
})

describe('getQuantityText', () => {
  it('troca o rótulo da quantidade conforme a unidade do item', () => {
    expect(getQuantityText('hora').label).toBe('Horas do certificado')
    expect(getQuantityText('palestra').label).toBe('Quantas palestras')
  })
})

const VALID: ActivityFormInput = {
  name: '  Curso de React  ',
  quantity: '2,5',
  startDate: '03/08/2026',
  endDate: '12/09/2026',
}

function messagesFor(values: Partial<ActivityFormInput>): Record<string, string | undefined> {
  const result = v.safeParse(ActivityFormSchema, { ...VALID, ...values })
  const nested = result.success ? {} : v.flatten<typeof ActivityFormSchema>(result.issues).nested

  return Object.fromEntries(Object.entries(nested ?? {}).map(([key, list]) => [key, list?.[0]]))
}

describe('ActivityFormSchema', () => {
  it('devolve os campos no formato do service: nome limpo, número e datas ISO', () => {
    expect(v.parse(ActivityFormSchema, VALID)).toEqual({
      name: 'Curso de React',
      quantity: 2.5,
      startDate: '2026-08-03',
      endDate: '2026-09-12',
    })
  })

  it('pede o nome quando ele está em branco', () => {
    expect(messagesFor({ name: '   ' }).name).toBe(
      'Digite o nome da atividade, como está no certificado.',
    )
  })

  it.each([
    ['', 'Digite a quantidade que aparece no certificado, por exemplo 40.'],
    ['quarenta', 'Digite só o número, por exemplo 40 ou 2,5.'],
    ['0', 'Digite um número maior que zero, por exemplo 40.'],
    ['1.000', 'Para mil, digite 1000. Para decimal, use vírgula, por exemplo 1,5.'],
    ['1.500', 'Para mil, digite 1000. Para decimal, use vírgula, por exemplo 1,5.'],
  ])('recusa a quantidade "%s" dizendo o que digitar', (quantity, message) => {
    expect(messagesFor({ quantity }).quantity).toBe(message)
  })

  it('pede o formato dd/mm/aaaa quando a data não existe', () => {
    expect(messagesFor({ startDate: '31/02/2026' }).startDate).toBe(
      'Digite a data no formato dd/mm/aaaa, por exemplo 12/09/2026.',
    )
  })

  it('pede a data de fim quando ela está em branco', () => {
    expect(messagesFor({ endDate: '' }).endDate).toBe(
      'Digite a data em que a atividade terminou, no formato dd/mm/aaaa.',
    )
  })

  it('mostra no campo do fim quando ele vem antes do início', () => {
    expect(messagesFor({ startDate: '12/09/2026', endDate: '03/08/2026' }).endDate).toBe(
      END_BEFORE_START_MESSAGE,
    )
  })
})

import * as v from 'valibot'
import { describe, expect, it } from 'vitest'

import { END_BEFORE_START_MESSAGE } from '@/services/activities'
import type { ProgressCategory } from '@/services/progress'
import type { RuleItem } from '@/services/rules'

import {
  ActivityFormSchema,
  buildPreview,
  describeCalc,
  formatBrDate,
  getQuantityText,
  maskBrDate,
  parseBrDate,
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

function category(itemNumber: number, countedHours: number): ProgressCategory {
  const rule = RULES.find((item) => item.itemNumber === itemNumber)

  return {
    itemNumber,
    name: rule?.name ?? '',
    countedHours,
    maxHours: rule?.maxHours ?? 0,
    hoursOverLimit: 0,
  }
}

function input(over: Partial<PreviewInput>): PreviewInput {
  return {
    activities: [],
    ruleItems: RULES,
    categories: [],
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
        categories: [category(13, 26)],
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
        categories: [category(13, 30)],
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

  it('mostra só quanto cabe enquanto a quantidade não é um número', () => {
    const preview = buildPreview(input({ quantity: null, categories: [category(7, 18)] }))

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
          categories: [category(13, 26)],
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
          categories: [category(13, 30)],
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
          categories: [category(7, 18), category(13, 26)],
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

describe('parseBrDate', () => {
  it('converte dd/mm/aaaa para ISO', () => {
    expect(parseBrDate('12/09/2026')).toBe('2026-09-12')
  })

  it.each(['31/02/2026', '12/9/2026', '2026-09-12', '', '99/99/9999'])('recusa "%s"', (text) => {
    expect(parseBrDate(text)).toBeNull()
  })
})

describe('maskBrDate', () => {
  it.each([
    ['12092026', '12/09/2026'],
    ['120', '12/0'],
    ['12/09/2026x', '12/09/2026'],
    ['1209202612', '12/09/2026'],
  ])('escreve "%s" como "%s"', (text, expected) => {
    expect(maskBrDate(text)).toBe(expected)
  })
})

describe('parseQuantity', () => {
  it.each([
    ['40', 40],
    ['2,5', 2.5],
    [' 3 ', 3],
  ])('lê "%s" como %d', (text, expected) => {
    expect(parseQuantity(text)).toBe(expected)
  })

  it.each(['', 'quarenta', '4,0,1', '-2'])('recusa "%s"', (text) => {
    expect(parseQuantity(text)).toBeNull()
  })
})

describe('formatBrDate', () => {
  it('escreve a data ISO como dd/mm/aaaa', () => {
    expect(formatBrDate('2026-09-12')).toBe('12/09/2026')
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

import * as v from 'valibot'
import { describe, expect, it } from 'vitest'

import { END_BEFORE_START_MESSAGE } from '@/services/activities'

import { ActivityFormSchema } from './schema'
import type { ActivityFormInput } from './schema'

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
  it('devolve os campos no formato do registro: nome limpo, número e datas ISO', () => {
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

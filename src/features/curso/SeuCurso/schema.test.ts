import * as v from 'valibot'
import { describe, expect, it } from 'vitest'

import { StartSemesterSchema } from '@/services/profile'

import { StartSemesterFormSchema } from './schema'

describe('StartSemesterFormSchema', () => {
  it('converte o primeiro semestre em 1º de janeiro', () => {
    expect(v.parse(StartSemesterFormSchema, '2023.1')).toBe('2023-01-01')
  })

  it('converte o segundo semestre em 1º de julho', () => {
    expect(v.parse(StartSemesterFormSchema, '2023.2')).toBe('2023-07-01')
  })

  it('ignora espaços nas pontas', () => {
    expect(v.parse(StartSemesterFormSchema, '  2023.2  ')).toBe('2023-07-01')
  })

  it('gera uma data que o service de perfil aceita', () => {
    const iso = v.parse(StartSemesterFormSchema, '2024.1')

    expect(v.safeParse(StartSemesterSchema, iso).success).toBe(true)
  })

  it('pede o semestre quando o campo está vazio', () => {
    const result = v.safeParse(StartSemesterFormSchema, '   ')

    expect(result.issues?.[0]?.message).toBe('Digite o ano e o semestre, como 2023.2.')
  })

  it.each(['2023', '2023-2', '2023/2', '23.2', '2023.0', '2023.3', '2023.12', 'abc'])(
    'recusa o formato "%s" e diz como digitar',
    (text) => {
      const result = v.safeParse(StartSemesterFormSchema, text)

      expect(result.success).toBe(false)
      expect(result.issues?.[0]?.message).toBe(
        'Use o ano, um ponto e o número 1 ou 2, como 2023.2.',
      )
    },
  )

  it('recusa semestre que ainda não começou', () => {
    const result = v.safeParse(StartSemesterFormSchema, '2999.1')

    expect(result.success).toBe(false)
    expect(result.issues?.[0]?.message).toBe(
      'Esse semestre ainda não começou. Digite o semestre em que você entrou.',
    )
  })
})

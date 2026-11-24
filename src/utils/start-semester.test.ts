// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import * as v from 'valibot'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { StartSemesterSchema } from '@/services/profile'

import { formatSemester, StartSemesterFormSchema } from './start-semester'

// Relógio fixo no meio do segundo semestre de 2026, no fuso do aparelho. Os testes de "futuro" não
// dependem de quando rodam.
beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date(2026, 10, 12, 10, 0, 0))
})

afterEach(() => {
  vi.useRealTimers()
})

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

  it('aceita o semestre em andamento', () => {
    expect(v.parse(StartSemesterFormSchema, '2026.2')).toBe('2026-07-01')
  })

  it('recusa o semestre que ainda não começou', () => {
    const result = v.safeParse(StartSemesterFormSchema, '2027.1')

    expect(result.success).toBe(false)
    expect(result.issues?.[0]?.message).toBe(
      'Esse semestre ainda não começou. Digite o semestre em que você entrou.',
    )
  })

  it('aceita o segundo semestre no próprio dia 1º de julho e recusa na véspera', () => {
    vi.setSystemTime(new Date(2026, 5, 30, 23, 59, 0))
    expect(v.safeParse(StartSemesterFormSchema, '2026.2').success).toBe(false)

    vi.setSystemTime(new Date(2026, 6, 1, 0, 0, 0))
    expect(v.safeParse(StartSemesterFormSchema, '2026.2').success).toBe(true)
  })
})

describe('formatSemester', () => {
  it('escreve 1º de janeiro como primeiro semestre', () => {
    expect(formatSemester('2023-01-01')).toBe('2023.1')
  })

  it('escreve 1º de julho como segundo semestre', () => {
    expect(formatSemester('2023-07-01')).toBe('2023.2')
  })

  it.each(['2023.1', '2023.2', '2019.2'])('desfaz o que o formulário converte em "%s"', (text) => {
    expect(formatSemester(v.parse(StartSemesterFormSchema, text))).toBe(text)
  })
})

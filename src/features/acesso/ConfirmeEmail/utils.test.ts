import { describe, expect, it } from 'vitest'

import { formatCountdown } from './utils'

describe('formatCountdown', () => {
  it('escreve segundos com dois dígitos', () => {
    expect(formatCountdown(45)).toBe('0:45')
    expect(formatCountdown(5)).toBe('0:05')
    expect(formatCountdown(0)).toBe('0:00')
  })

  it('passa de 59 segundos para minutos', () => {
    expect(formatCountdown(60)).toBe('1:00')
    expect(formatCountdown(75)).toBe('1:15')
  })

  it('não mostra tempo negativo', () => {
    expect(formatCountdown(-3)).toBe('0:00')
  })
})

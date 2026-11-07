import { describe, expect, it } from 'vitest'

import { formatHours } from './format-hours'

describe('formatHours', () => {
  it('usa uma casa e vírgula por padrão', () => {
    expect(formatHours(4)).toBe('4,0h')
    expect(formatHours(18.04)).toBe('18,0h')
    expect(formatHours(0)).toBe('0,0h')
  })

  it('escreve o total inteiro com fractionDigits 0', () => {
    expect(formatHours(47, { fractionDigits: 0 })).toBe('47h')
  })

  it('separa o milhar com ponto', () => {
    expect(formatHours(1234.5)).toBe('1.234,5h')
  })
})

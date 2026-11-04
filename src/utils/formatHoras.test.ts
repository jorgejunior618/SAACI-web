import { describe, expect, it } from 'vitest'

import { formatHoras, formatHorasInteiras } from './formatHoras'

describe('formatHoras', () => {
  it('usa uma casa decimal com vírgula', () => {
    expect(formatHoras(10)).toBe('10,0h')
    expect(formatHoras(2.5)).toBe('2,5h')
  })
})

describe('formatHorasInteiras', () => {
  it('mostra o total sem casas decimais, arredondando para baixo', () => {
    expect(formatHorasInteiras(61)).toBe('61h')
    expect(formatHorasInteiras(119.5)).toBe('119h')
  })
})

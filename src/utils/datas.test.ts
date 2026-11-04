import { describe, expect, it } from 'vitest'

import { formatData, formatDataHora, parseData } from './datas'

describe('formatData', () => {
  it('mostra no formato dd/mm/aaaa', () => {
    expect(formatData('2025-05-03')).toBe('03/05/2025')
    expect(formatData('2026-10-31T15:30:00.000Z')).toBe('31/10/2026')
  })
})

describe('formatDataHora', () => {
  it('junta data e hora com vírgula', () => {
    expect(formatDataHora(new Date(2026, 9, 31, 15, 30))).toBe('31/10/2026, 15:30')
  })
})

describe('parseData', () => {
  it('converte dd/mm/aaaa para ISO', () => {
    expect(parseData('12/09/2026')).toBe('2026-09-12')
  })

  it('recusa formato errado e data que não existe', () => {
    expect(parseData('2026-09-12')).toBeNull()
    expect(parseData('31/02/2026')).toBeNull()
  })
})

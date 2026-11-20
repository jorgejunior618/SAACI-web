import { describe, expect, it } from 'vitest'

import { formatBrDate, maskBrDate, parseBrDate } from './br-date'

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

describe('formatBrDate', () => {
  it('escreve a data ISO como dd/mm/aaaa', () => {
    expect(formatBrDate('2026-09-12')).toBe('12/09/2026')
  })
})

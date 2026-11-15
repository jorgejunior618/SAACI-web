import { describe, expect, it } from 'vitest'

import { formatDate } from './format-date'

describe('formatDate', () => {
  it('escreve a data ISO como dia, mês e ano', () => {
    expect(formatDate('2025-05-03')).toBe('03/05/2025')
  })

  it('não muda o dia na virada do ano', () => {
    expect(formatDate('2025-12-31')).toBe('31/12/2025')
    expect(formatDate('2026-01-01')).toBe('01/01/2026')
  })
})

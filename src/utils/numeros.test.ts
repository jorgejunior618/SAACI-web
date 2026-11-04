import { describe, expect, it } from 'vitest'

import { formatNumero, parseNumero } from './numeros'

describe('parseNumero', () => {
  it('aceita vírgula ou ponto decimal', () => {
    expect(parseNumero('40')).toBe(40)
    expect(parseNumero('1,5')).toBe(1.5)
  })

  it('recusa texto, zero e negativo', () => {
    expect(parseNumero('quarenta')).toBeNull()
    expect(parseNumero('0')).toBeNull()
    expect(parseNumero('-2')).toBeNull()
  })
})

describe('formatNumero', () => {
  it('usa vírgula e não mostra casas inúteis', () => {
    expect(formatNumero(40)).toBe('40')
    expect(formatNumero(1.5)).toBe('1,5')
  })
})

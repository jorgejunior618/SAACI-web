import { describe, expect, it } from 'vitest'

import { descreverCalculo, descreverRegraCurta, formatQuantidade } from './cursos.format'
import { CURSOS_MOCK } from './cursos.mock'

const item = (numero: number) => CURSOS_MOCK[0].itens.find((i) => i.numero === numero)!

describe('descreverCalculo', () => {
  it('escreve a conta como o design mostra', () => {
    expect(descreverCalculo(item(7), 40)).toBe('40h de curso ÷ 4')
    expect(descreverCalculo(item(13), 3)).toBe('3 palestras × 2h')
    expect(descreverCalculo(item(13), 1)).toBe('1 palestra × 2h')
    expect(descreverCalculo(item(16), 25)).toBe('25 páginas × 3h ÷ 10')
    expect(descreverCalculo(item(21), 0.85)).toBe('6h × fator 0,85')
  })
})

describe('formatQuantidade', () => {
  it('usa o singular para uma unidade', () => {
    expect(formatQuantidade(item(12), 1)).toBe('1 dia de evento')
    expect(formatQuantidade(item(12), 3)).toBe('3 dias de evento')
  })
})

describe('descreverRegraCurta', () => {
  it('resume a regra numa frase', () => {
    expect(descreverRegraCurta(item(7))).toBe('cada 4h de curso valem 1h')
    expect(descreverRegraCurta(item(13))).toBe('cada palestra vale 2h')
  })
})

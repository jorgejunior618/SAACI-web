import { describe, expect, it } from 'vitest'

import { describeEmpty, filterItems, normalizeText } from './utils'

const items = [
  { number: 6, name: 'Curso de línguas', rule: '1h para cada 4h de curso, até 60h' },
  {
    number: 7,
    name: 'Curso na área de engenharia de computação',
    rule: '1h para cada 4h, até 60h',
  },
  { number: 12, name: 'Evento científico', rule: 'Participação em congresso ou semana acadêmica' },
  { number: 13, name: 'Palestra como ouvinte', rule: 'Cada palestra conta 2h, até 30h' },
  { number: 20, name: 'Projeto de extensão', rule: 'Horas do certificado, até 40h' },
]

describe('normalizeText', () => {
  it('tira acento, maiúscula e espaço nas pontas', () => {
    expect(normalizeText('  Extensão ')).toBe('extensao')
    expect(normalizeText('Computação')).toBe('computacao')
    expect(normalizeText('ÁREA')).toBe('area')
  })
})

describe('filterItems', () => {
  it('acha pelo nome', () => {
    expect(filterItems(items, 'palestra').map((item) => item.number)).toEqual([13])
  })

  it('acha pela regra, mesmo que o nome não tenha a palavra', () => {
    // "congresso" só existe na regra do item 12.
    expect(filterItems(items, 'congresso').map((item) => item.number)).toEqual([12])
  })

  it('ignora acento e maiúscula nos dois lados', () => {
    expect(filterItems(items, 'EXTENSAO').map((item) => item.number)).toEqual([20])
    expect(filterItems(items, 'linguas').map((item) => item.number)).toEqual([6])
    expect(filterItems(items, 'academica').map((item) => item.number)).toEqual([12])
  })

  it('mantém a ordem do formulário', () => {
    expect(filterItems(items, 'curso').map((item) => item.number)).toEqual([6, 7])
  })

  it('exige todas as palavras, em qualquer ordem', () => {
    expect(filterItems(items, 'engenharia curso').map((item) => item.number)).toEqual([7])
    expect(filterItems(items, 'curso hackathon')).toEqual([])
  })

  it('busca vazia ou só com espaço devolve todos', () => {
    expect(filterItems(items, '')).toEqual(items)
    expect(filterItems(items, '   ')).toEqual(items)
  })

  it('devolve lista vazia quando nada casa', () => {
    expect(filterItems(items, 'hackathon')).toEqual([])
  })
})

describe('describeEmpty', () => {
  it('diz o que tentar quando há sugestões', () => {
    expect(describeEmpty('hackathon', ['evento', 'curso'])).toBe(
      "Nenhum item tem 'hackathon'. Tente 'evento' ou 'curso'.",
    )
  })

  it('só diz que nada foi achado quando não há sugestões', () => {
    expect(describeEmpty('  hackathon ')).toBe("Nenhum item tem 'hackathon'.")
  })
})

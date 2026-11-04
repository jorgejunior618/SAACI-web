import { describe, expect, it } from 'vitest'

import {
  type AtividadeParaCalculo,
  arredondarHoras,
  calcularItem,
  calcularTotal,
  valorDaAtividade,
} from './progresso.calc'

const ITEM_7 = { numero: 7, limite: 60, conversao: { horas: 1, por: 4 } }
const ITEM_13 = { numero: 13, limite: 30, conversao: { horas: 2, por: 1 } }

let seq = 0
const atividade = (
  itemNumero: number,
  quantidade: number,
  dataFim: string,
): AtividadeParaCalculo => ({
  id: `a${++seq}`,
  itemNumero,
  quantidade,
  dataFim,
  registradaEm: `2026-10-0${seq % 9}T10:00:00.000Z`,
})

describe('arredondarHoras', () => {
  it('usa uma casa decimal, sempre para baixo (RF14)', () => {
    expect(arredondarHoras(2.5)).toBe(2.5)
    expect(arredondarHoras(4 / 3)).toBe(1.3)
    expect(arredondarHoras(2 / 3)).toBe(0.6)
  })
})

describe('valorDaAtividade', () => {
  it('converte pela regra do item', () => {
    expect(valorDaAtividade(ITEM_7, 40)).toBe(10)
    expect(valorDaAtividade(ITEM_7, 10)).toBe(2.5)
    expect(valorDaAtividade(ITEM_13, 3)).toBe(6)
  })
})

describe('calcularItem', () => {
  it('soma o que conta e mostra quanto ainda cabe', () => {
    const resultado = calcularItem(
      ITEM_7,
      [atividade(7, 32, '2025-05-03'), atividade(7, 40, '2025-11-14')],
      '2023.2',
    )

    expect(resultado.usado).toBe(18)
    expect(resultado.cabem).toBe(42)
    expect(resultado.atividades.map((a) => a.status)).toEqual(['conta', 'conta'])
  })

  it('a atividade mais recente é a que fica de fora quando o item enche', () => {
    const recente = atividade(13, 1, '2026-10-18')
    const antigas = Array.from({ length: 14 }, () => atividade(13, 1, '2025-03-12'))
    const extra = atividade(13, 1, '2025-04-01')

    const resultado = calcularItem(ITEM_13, [recente, ...antigas, extra], '2023.2')
    const daRecente = resultado.atividades.find((a) => a.id === recente.id)

    expect(resultado.atividades).toHaveLength(16)
    expect(resultado.usado).toBe(30)
    expect(daRecente).toMatchObject({ status: 'nao_conta', contada: 0, motivo: 'item_cheio' })
    expect(resultado.excedente).toBe(2)
  })

  it('conta só a parte que cabe', () => {
    const resultado = calcularItem(
      ITEM_13,
      [atividade(13, 13, '2025-03-01'), atividade(13, 3, '2026-10-22')],
      '2023.2',
    )

    expect(resultado.atividades[1]).toMatchObject({ status: 'parcial', valor: 6, contada: 4 })
    expect(resultado.isCheio).toBe(true)
  })

  it('atividade antes do ingresso não conta e não ocupa espaço no item', () => {
    const resultado = calcularItem(ITEM_13, [atividade(13, 1, '2023-02-10')], '2023.2')

    expect(resultado.atividades[0]).toMatchObject({
      status: 'nao_conta',
      motivo: 'antes_do_ingresso',
    })
    expect(resultado.usado).toBe(0)
    expect(resultado.excedente).toBe(0)
  })
})

describe('calcularTotal', () => {
  it('limita o pedido à meta e não deixa faltar horas negativas', () => {
    const cheio = calcularItem(
      { numero: 1, limite: 200, conversao: { horas: 1, por: 1 } },
      [atividade(1, 124, '2025-01-10')],
      '2023.1',
    )

    expect(calcularTotal([cheio], 120)).toEqual({ meta: 120, feito: 124, pedido: 120, faltam: 0 })
  })

  it('arredonda o total para baixo', () => {
    const item = calcularItem(ITEM_7, [atividade(7, 238, '2025-01-10')], '2023.1')

    expect(item.usado).toBe(59.5)
    expect(calcularTotal([item], 120)).toMatchObject({ feito: 59, faltam: 61 })
  })
})

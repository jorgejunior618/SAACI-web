import { beforeEach, describe, expect, it } from 'vitest'

import { aplicarFixture } from '../_mock'
import { getSessao } from '../conta/conta.api'
import { getProgresso } from '../progresso/progresso.api'

import { montarPedido } from './formulario.pedido'

describe('montarPedido', () => {
  beforeEach(() => aplicarFixture('completo'))

  it('limita o total do pedido à meta', async () => {
    const pedido = montarPedido(await getProgresso(), (await getSessao())!)

    expect(pedido).toMatchObject({ feito: 124, total: 120, pendencias: [] })
    expect(pedido.linhas).toHaveLength(24)
    expect(pedido.linhasComHoras.map((l) => l.numero)).toEqual([1, 7, 12])
  })

  it('lista o que falta para o pedido ficar pronto', async () => {
    aplicarFixture('com-atividades')
    const sessao = { ...(await getSessao())!, matricula: null }

    expect(montarPedido(await getProgresso(), sessao).pendencias).toEqual(['horas', 'matricula'])
  })
})

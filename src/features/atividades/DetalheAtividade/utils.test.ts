import { describe, expect, it } from 'vitest'

import { aplicarFixture } from '@/services/_mock'
import { getProgresso } from '@/services/progresso'

import { explicarResultado } from './utils'

describe('explicarResultado', () => {
  it('explica a atividade de antes do ingresso com a data e o semestre', async () => {
    aplicarFixture('com-atividades')
    const progresso = await getProgresso()
    const item13 = progresso.itens.find((i) => i.item.numero === 13)!
    const boasVindas = item13.atividades.find((a) => a.id === 'boas-vindas')!

    expect(explicarResultado(boasVindas, item13.item, progresso.ingresso)).toBe(
      'Não conta porque terminou em 10/02/2023, antes do seu ingresso em 2023.2. Só valem atividades feitas depois do ingresso.',
    )
  })

  it('explica o que ficou de fora quando o item enche', async () => {
    aplicarFixture('item-no-limite')
    const progresso = await getProgresso()
    const item13 = progresso.itens.find((i) => i.item.numero === 13)!
    const ciclo = item13.atividades.find((a) => a.id === 'ciclo')!

    expect(ciclo.status).toBe('parcial')
    expect(explicarResultado(ciclo, item13.item, progresso.ingresso)).toMatch(
      /^Ficou 4,0h de fora porque o item 13 chegou ao limite de 30h/,
    )
  })
})

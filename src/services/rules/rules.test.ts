import { describe, expect, it } from 'vitest'

import { getCourse, getCourses, getRuleItems } from './rules.api'

describe('regras', () => {
  it('entrega os 24 itens do formulário em ordem', async () => {
    const items = await getRuleItems('engenharia-de-computacao')

    expect(items).toHaveLength(24)
    expect(items.map((item) => item.itemNumber)).toEqual(
      Array.from({ length: 24 }, (_, i) => i + 1),
    )
  })

  it('guarda a razão em campos coerente com o texto da regra', async () => {
    const items = await getRuleItems('engenharia-de-computacao')
    const byNumber = new Map(items.map((item) => [item.itemNumber, item]))

    expect(byNumber.get(6)).toMatchObject({
      rule: '1h a cada 4h de curso, até 60h',
      ratio: { hours: 1, per: 4, unit: 'hora' },
      maxHours: 60,
    })
    expect(byNumber.get(9)?.ratio).toEqual({ hours: 2, per: 1, unit: 'hora' })
    expect(byNumber.get(13)?.ratio).toEqual({ hours: 2, per: 1, unit: 'palestra' })
    expect(byNumber.get(16)?.ratio).toEqual({ hours: 3, per: 10, unit: 'pagina' })
    expect(byNumber.get(24)?.ratio).toEqual({ hours: 8, per: 1, unit: 'fator_qualis' })
  })

  it('todo item tem o máximo escrito no texto da regra', async () => {
    const items = await getRuleItems('engenharia-de-computacao')

    for (const item of items) expect(item.rule).toContain(`até ${item.maxHours}h`)
  })

  it('busca curso sem diferenciar acento nem caixa', async () => {
    expect(await getCourses('COMPUTACAO')).toHaveLength(1)
    expect(await getCourses('arquitetura')).toEqual([])
  })

  it('devolve null para curso que não existe e lista vazia sem regras', async () => {
    expect(await getCourse('nao-existe')).toBeNull()
    expect(await getRuleItems('nao-existe')).toEqual([])
  })
})

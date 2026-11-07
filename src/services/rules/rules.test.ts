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

  it('busca curso sem diferenciar acento nem caixa', async () => {
    expect(await getCourses('COMPUTACAO')).toHaveLength(1)
    expect(await getCourses('arquitetura')).toEqual([])
  })

  it('devolve null para curso que não existe e lista vazia sem regras', async () => {
    expect(await getCourse('nao-existe')).toBeNull()
    expect(await getRuleItems('nao-existe')).toEqual([])
  })
})

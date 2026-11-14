import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getCourse, getCourses, getRuleItems } from './rules.api'

const COURSE_ID = '3b1f6d2e-5a47-4c80-9e1b-7d0c2a4f8e11'

const COURSE_ROW = {
  id: COURSE_ID,
  nome: 'Engenharia de Computação',
  grau: 'Bacharelado',
  campus: 'Fortaleza',
  carga_total_horas: 120,
}

const ITEM_ROW = {
  numero: 6,
  nome: 'Curso de línguas',
  regra: '1h a cada 4h de curso, até 60h',
  horas: 1,
  a_cada: 4,
  unidade: 'hora',
  maximo_horas: 60,
}

const ilike = vi.fn()
const eq = vi.fn()
const order = vi.fn()
const maybeSingle = vi.fn()
const select = vi.fn()
const from = vi.fn()

// Só o navegador cria cliente; o mock devolve sempre o mesmo, com o construtor de query falso.
vi.mock('@supabase/client', () => ({ createClient: () => ({ from }) }))

beforeEach(() => {
  vi.resetAllMocks()

  const builder = { ilike, eq, order, maybeSingle }

  from.mockReturnValue({ select })
  select.mockReturnValue(builder)
  ilike.mockReturnValue(builder)
  eq.mockReturnValue(builder)
})

describe('cursos', () => {
  it('traduz a row do banco para o tipo de domínio', async () => {
    order.mockResolvedValue({ data: [COURSE_ROW], error: null })

    expect(await getCourses()).toEqual([
      {
        id: COURSE_ID,
        name: 'Engenharia de Computação',
        degree: 'Bacharelado',
        campus: 'Fortaleza',
        targetHours: 120,
      },
    ])
    expect(from).toHaveBeenCalledWith('cursos')
    expect(ilike).not.toHaveBeenCalled()
    expect(order).toHaveBeenCalledWith('nome')
  })

  it('normaliza o termo, tirando acento e caixa, antes de filtrar', async () => {
    order.mockResolvedValue({ data: [], error: null })

    await getCourses('  COMPUTAÇÃO ')

    expect(ilike).toHaveBeenCalledWith('nome_busca', '%computacao%')
  })

  it('escapa os caracteres que o ilike trata como padrão', async () => {
    order.mockResolvedValue({ data: [], error: null })

    await getCourses('100%_a\\b')

    expect(ilike).toHaveBeenCalledWith('nome_busca', '%100\\%\\_a\\\\b%')
  })

  it('repassa o erro do banco sem traduzir', async () => {
    const failure = new Error('falha de rede')

    order.mockResolvedValue({ data: null, error: failure })

    await expect(getCourses()).rejects.toBe(failure)
  })

  it('recusa a row fora do formato em vez de levá-la à tela', async () => {
    order.mockResolvedValue({ data: [{ ...COURSE_ROW, carga_total_horas: null }], error: null })

    await expect(getCourses()).rejects.toThrow()
  })

  it('devolve o curso pelo id', async () => {
    maybeSingle.mockResolvedValue({ data: COURSE_ROW, error: null })

    expect(await getCourse(COURSE_ID)).toMatchObject({ id: COURSE_ID, targetHours: 120 })
    expect(eq).toHaveBeenCalledWith('id', COURSE_ID)
  })

  it('devolve null quando o curso não existe', async () => {
    maybeSingle.mockResolvedValue({ data: null, error: null })

    expect(await getCourse('7c9e6679-7425-40de-944b-e07fc1f90ae7')).toBeNull()
  })

  it('devolve null para id que não é uuid, sem consultar o banco', async () => {
    expect(await getCourse('engenharia-de-computacao')).toBeNull()
    expect(from).not.toHaveBeenCalled()
  })
})

describe('itens do curso', () => {
  it('traduz as rows e pede a ordem do formulário', async () => {
    order.mockResolvedValue({ data: [ITEM_ROW], error: null })

    expect(await getRuleItems(COURSE_ID)).toEqual([
      {
        itemNumber: 6,
        name: 'Curso de línguas',
        rule: '1h a cada 4h de curso, até 60h',
        ratio: { hours: 1, per: 4, unit: 'hora' },
        maxHours: 60,
      },
    ])
    expect(eq).toHaveBeenCalledWith('curso_id', COURSE_ID)
    expect(order).toHaveBeenCalledWith('numero')
  })

  it('devolve lista vazia para id que não é uuid, sem consultar o banco', async () => {
    expect(await getRuleItems('nao-existe')).toEqual([])
    expect(from).not.toHaveBeenCalled()
  })

  it('repassa o erro do banco sem traduzir', async () => {
    const failure = new Error('falha de rede')

    order.mockResolvedValue({ data: null, error: failure })

    await expect(getRuleItems(COURSE_ID)).rejects.toBe(failure)
  })

  it('recusa o item com número fora do formulário', async () => {
    order.mockResolvedValue({ data: [{ ...ITEM_ROW, numero: 0 }], error: null })

    await expect(getRuleItems(COURSE_ID)).rejects.toThrow()
  })

  it('recusa o item com razão que não dá para calcular', async () => {
    order.mockResolvedValue({ data: [{ ...ITEM_ROW, a_cada: 0 }], error: null })

    await expect(getRuleItems(COURSE_ID)).rejects.toThrow()
  })

  it('recusa o item com unidade que o cálculo não conhece', async () => {
    order.mockResolvedValue({ data: [{ ...ITEM_ROW, unidade: 'semestre' }], error: null })

    await expect(getRuleItems(COURSE_ID)).rejects.toThrow()
  })
})

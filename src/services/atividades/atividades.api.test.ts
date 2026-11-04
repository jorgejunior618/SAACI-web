import { beforeEach, describe, expect, it } from 'vitest'

import { aplicarFixture, lerCopia, salvarCopia } from '../_mock'
import { getProgresso } from '../progresso/progresso.api'

import { getAtividades } from './atividades.api'
import { createAtividade, removeAtividade } from './atividades.mutations'

beforeEach(() => aplicarFixture('com-atividades'))

const arquivo = (): File =>
  new File(['%PDF'], 'certificado-curso-git.pdf', { type: 'application/pdf' })

describe('atividades (mock)', () => {
  it('a conta de exemplo soma 59h, como no design', async () => {
    const { total } = await getProgresso()

    expect(total).toMatchObject({ feito: 59, faltam: 61, meta: 120 })
  })

  it('a atividade registrada entra no total', async () => {
    await createAtividade({
      itemNumero: 7,
      nome: 'Curso de React com TypeScript',
      quantidade: 40,
      dataFim: '2026-09-12',
      arquivo: arquivo(),
    })

    expect((await getProgresso()).total.feito).toBe(69)
  })

  it('a atividade removida sai da lista e do total, e leva a cópia do comprovante junto', async () => {
    salvarCopia('python', 'data:image/jpeg;base64,AAAA')

    await removeAtividade('python')

    expect(lerCopia('python')).toBeNull()

    expect((await getAtividades()).map((a) => a.id)).not.toContain('python')
    expect((await getProgresso()).total.feito).toBe(49)
  })

  it('recusa comprovante que não é PDF, JPG ou PNG', async () => {
    const planilha = new File(['x'], 'horas.xlsx', { type: 'application/vnd.ms-excel' })

    await expect(
      createAtividade({
        itemNumero: 7,
        nome: 'X',
        quantidade: 4,
        dataFim: '2026-01-01',
        arquivo: planilha,
      }),
    ).rejects.toThrow('Esse arquivo não é PDF, JPG ou PNG.')
  })
})

describe('banco do mock', () => {
  it('começa vazio, sem conta e sem sessão', async () => {
    const { apagarTudo } = await import('../_mock')
    const { getSessao } = await import('../conta/conta.api')
    apagarTudo()

    expect(await getSessao()).toBeNull()
  })
})

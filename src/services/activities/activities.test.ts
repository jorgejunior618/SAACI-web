import { beforeEach, describe, expect, it } from 'vitest'

import { getActivities, getActivity, readProof } from './activities.api'
import { StaleActivityError, UnreadableProofError } from './activities.errors'
import { resetActivitiesMock } from './activities.mock'
import { createActivity, removeActivity, updateActivity } from './activities.mutations'

function pdf(name = 'certificado.pdf'): File {
  return new File(['conteudo'], name, { type: 'application/pdf' })
}

describe('atividades', () => {
  beforeEach(resetActivitiesMock)

  it('lista as 9 atividades por item e por data', async () => {
    const list = await getActivities()

    expect(list).toHaveLength(9)
    expect(list.map((a) => a.itemNumber)).toEqual([6, 7, 7, 12, 12, 13, 13, 13, 13])
    expect(list.filter((a) => a.itemNumber === 13).map((a) => a.activityDate)).toEqual([
      '2023-02-10',
      '2025-03-12',
      '2025-09-20',
      '2026-10-22',
    ])
  })

  it('marca a atividade anterior ao ingresso como não conta', async () => {
    const list = await getActivities()
    const notCounted = list.filter((a) => a.status === 'nao_conta')

    expect(notCounted).toHaveLength(1)
    expect(notCounted[0]).toMatchObject({ countedHours: 0, reason: 'antes_do_ingresso' })
  })

  it('registra uma atividade nova e ela aparece na lista', async () => {
    const created = await createActivity({
      name: 'Curso de React com TypeScript',
      itemNumber: 7,
      quantity: 40,
      activityDate: '2026-09-12',
      proof: pdf(),
    })

    expect(created.proof).toMatchObject({ fileName: 'certificado.pdf', type: 'pdf' })
    expect(await getActivities()).toHaveLength(10)
    expect(await getActivity(created.id)).toEqual(created)
  })

  it('recusa comprovante de tipo não aceito', async () => {
    await expect(
      createActivity({
        name: 'Curso',
        itemNumber: 7,
        quantity: 4,
        activityDate: '2026-09-12',
        proof: new File(['x'], 'foto.gif', { type: 'image/gif' }),
      }),
    ).rejects.toThrow()
  })

  it('corrige uma atividade e recusa correção sobre versão velha', async () => {
    const [first] = await getActivities()

    if (!first) throw new Error('mock sem atividade')
    const corrected = await updateActivity(first.id, first.updatedAt, {
      name: 'Novo nome',
    })

    expect(corrected.name).toBe('Novo nome')
    await expect(
      updateActivity(first.id, first.updatedAt, { name: 'Outro' }),
    ).rejects.toBeInstanceOf(StaleActivityError)
  })

  it('remove a atividade e devolve null ao buscar', async () => {
    const [first] = await getActivities()

    if (!first) throw new Error('mock sem atividade')
    await removeActivity(first.id)

    expect(await getActivity(first.id)).toBeNull()
    expect(await getActivities()).toHaveLength(8)
  })

  it('lê o comprovante e cobre os três caminhos do mock', async () => {
    expect(await readProof(pdf())).toMatchObject({ itemNumber: 7, quantity: 40 })
    expect(await readProof(pdf('sem-item.pdf'))).toMatchObject({ itemNumber: null })
    await expect(readProof(pdf('ilegivel.pdf'))).rejects.toBeInstanceOf(UnreadableProofError)
  })
})

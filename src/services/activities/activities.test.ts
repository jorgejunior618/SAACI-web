import { beforeEach, describe, expect, it, vi } from 'vitest'

import { resetProfileMock } from '../profile/profile.mock'
import { updateProfile } from '../profile/profile.mutations'
import type { RuleItem } from '../rules/rules.types'
import { getActivities, getActivity, readProof } from './activities.api'
import {
  InvalidActivityDatesError,
  StaleActivityError,
  UnreadableProofError,
} from './activities.errors'
import { resetActivitiesMock } from './activities.mock'
import { createActivity, removeActivity, updateActivity } from './activities.mutations'

// As regras moram no Supabase. Aqui ficam só os itens que as seeds e os testes usam, com a razão e o
// máximo da migration `regras_dos_cursos`.
const rules = vi.hoisted(() => ({
  courseId: '3b1f6d2e-5a47-4c80-9e1b-7d0c2a4f8e11',
  items: [
    {
      itemNumber: 6,
      name: 'Curso de línguas',
      rule: '1h a cada 4h de curso, até 60h',
      ratio: { hours: 1, per: 4, unit: 'hora' },
      maxHours: 60,
    },
    {
      itemNumber: 7,
      name: 'Curso na área de engenharia de computação',
      rule: '1h a cada 4h de curso, até 60h',
      ratio: { hours: 1, per: 4, unit: 'hora' },
      maxHours: 60,
    },
    {
      itemNumber: 12,
      name: 'Participação em eventos técnicos ou científicos na área do curso',
      rule: '4h por dia de evento, até 40h',
      ratio: { hours: 4, per: 1, unit: 'dia_evento' },
      maxHours: 40,
    },
    {
      itemNumber: 13,
      name: 'Ouvinte em palestras da área do curso',
      rule: '2h por palestra, até 30h',
      ratio: { hours: 2, per: 1, unit: 'palestra' },
      maxHours: 30,
    },
  ] satisfies RuleItem[],
}))

vi.mock('../rules/rules.api', () => ({ getRuleItems: () => Promise.resolve(rules.items) }))

function pdf(name = 'certificado.pdf'): File {
  return new File(['conteudo'], name, { type: 'application/pdf' })
}

describe('atividades', () => {
  beforeEach(async () => {
    resetActivitiesMock()
    resetProfileMock()
    await updateProfile({ courseId: rules.courseId, startSemester: '2023-07-01' })
  })

  it('lista as 9 atividades por item e pela data em que terminaram', async () => {
    const list = await getActivities()

    expect(list).toHaveLength(9)
    expect(list.map((a) => a.itemNumber)).toEqual([6, 7, 7, 12, 12, 13, 13, 13, 13])
    expect(list.filter((a) => a.itemNumber === 13).map((a) => a.endDate)).toEqual([
      '2023-02-10',
      '2025-03-12',
      '2025-09-20',
      '2026-10-22',
    ])
  })

  it('calcula as horas de cada atividade pela regra do item', async () => {
    const list = await getActivities()

    expect(list.map((a) => a.countedHours)).toEqual([15, 8, 10, 12, 4, 0, 2, 2, 6])
  })

  it('marca a atividade que começou antes do ingresso como não conta (RF38)', async () => {
    const list = await getActivities()
    const notCounted = list.filter((a) => a.status === 'nao_conta')

    expect(notCounted).toHaveLength(1)
    expect(notCounted[0]).toMatchObject({ countedHours: 0, reason: 'antes_do_ingresso' })
  })

  it('passa a contar a atividade antiga quando o semestre de ingresso muda', async () => {
    await updateProfile({ startSemester: '2023-01-01' })
    const list = await getActivities()

    expect(list.every((a) => a.status === 'conta')).toBe(true)
  })

  it('registra uma atividade nova e ela conta pela razão do item', async () => {
    const created = await createActivity({
      name: 'Curso de React com TypeScript',
      itemNumber: 7,
      quantity: 40,
      startDate: '2026-08-03',
      endDate: '2026-09-12',
      proof: pdf(),
    })

    expect(created).toMatchObject({ countedHours: 10, status: 'conta', reason: null })
    expect(created.proof).toMatchObject({ fileName: 'certificado.pdf', type: 'pdf' })
    expect(await getActivities()).toHaveLength(10)
    expect(await getActivity(created.id)).toEqual(created)
  })

  it('a atividade que passa do máximo do item fica parcial (RF16)', async () => {
    // item 13: 2h por palestra, até 30h. As seeds já ocupam 10h, então 12 palestras (24h) só cabem 20h.
    const created = await createActivity({
      name: 'Maratona de palestras',
      itemNumber: 13,
      quantity: 12,
      startDate: '2026-10-25',
      endDate: '2026-10-30',
      proof: pdf(),
    })

    expect(created).toMatchObject({ countedHours: 20, status: 'parcial', reason: 'item_cheio' })
  })

  it('recusa data de fim antes da de início', async () => {
    await expect(
      createActivity({
        name: 'Curso',
        itemNumber: 7,
        quantity: 4,
        startDate: '2026-09-12',
        endDate: '2026-09-01',
        proof: pdf(),
      }),
    ).rejects.toThrow()
  })

  it('recusa comprovante de tipo não aceito', async () => {
    await expect(
      createActivity({
        name: 'Curso',
        itemNumber: 7,
        quantity: 4,
        startDate: '2026-09-01',
        endDate: '2026-09-12',
        proof: new File(['x'], 'foto.gif', { type: 'image/gif' }),
      }),
    ).rejects.toThrow()
  })

  it('corrige uma atividade, recalcula as horas e recusa correção sobre versão velha', async () => {
    const [first] = await getActivities()

    if (!first) throw new Error('mock sem atividade')
    const corrected = await updateActivity(first.id, first.updatedAt, {
      name: 'Novo nome',
      quantity: 80,
    })

    expect(corrected).toMatchObject({ name: 'Novo nome', countedHours: 20 })
    await expect(
      updateActivity(first.id, first.updatedAt, { name: 'Outro' }),
    ).rejects.toBeInstanceOf(StaleActivityError)
  })

  it('recusa corrigir só a data de fim para antes do início que ficou', async () => {
    const [first] = await getActivities()

    if (!first) throw new Error('mock sem atividade')
    await expect(
      updateActivity(first.id, first.updatedAt, { endDate: '2020-01-01' }),
    ).rejects.toBeInstanceOf(InvalidActivityDatesError)
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

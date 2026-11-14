import { beforeEach, describe, expect, it, vi } from 'vitest'

import { resetActivitiesMock } from '../activities/activities.mock'
import { createActivity, removeActivity } from '../activities/activities.mutations'
import { resetProfileMock } from '../profile/profile.mock'
import { updateProfile } from '../profile/profile.mutations'
import type { Course, RuleItem } from '../rules/rules.types'
import { getProgress } from './progress.api'

// As regras moram no Supabase. Aqui ficam só o curso e os itens que as seeds e os testes usam, com a
// razão e o máximo da migration `regras_dos_cursos`.
const rules = vi.hoisted(() => {
  const courseId = '3b1f6d2e-5a47-4c80-9e1b-7d0c2a4f8e11'

  return {
    courseId,
    course: {
      id: courseId,
      name: 'Engenharia de Computação',
      degree: 'Bacharelado',
      campus: 'Fortaleza',
      targetHours: 120,
    } satisfies Course,
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
  }
})

vi.mock('../rules/rules.api', () => ({
  getCourse: () => Promise.resolve(rules.course),
  getRuleItems: () => Promise.resolve(rules.items),
}))

function pdf(): File {
  return new File(['conteudo'], 'certificado.pdf', { type: 'application/pdf' })
}

describe('progress', () => {
  beforeEach(async () => {
    resetActivitiesMock()
    resetProfileMock()
    await updateProfile({ courseId: rules.courseId, startSemester: '2023-07-01' })
  })

  it('calcula as seeds em 59h de 120h, com faltam igual à meta menos o total', async () => {
    const progress = await getProgress()

    expect(progress).toMatchObject({ totalHours: 59, targetHours: 120, missingHours: 61 })
    expect(progress.categories.map((c) => [c.itemNumber, c.countedHours])).toEqual([
      [6, 15],
      [7, 18],
      [12, 16],
      [13, 10],
    ])
    expect(progress.categories.reduce((sum, c) => sum + c.countedHours, 0)).toBe(progress.itemsSum)
  })

  it('registrar uma atividade muda o total', async () => {
    await createActivity({
      name: 'Curso de React com TypeScript',
      itemNumber: 7,
      quantity: 40,
      startDate: '2026-08-03',
      endDate: '2026-09-12',
      proof: pdf(),
    })

    expect(await getProgress()).toMatchObject({ totalHours: 69, missingHours: 51 })
  })

  it('remover uma atividade tira as horas dela do total', async () => {
    // a primeira seed é o curso de inglês, que conta 15h
    await removeActivity('00000000-0000-4000-8000-000000000001')

    expect((await getProgress()).totalHours).toBe(44)
  })

  it('mudar o semestre de ingresso muda o total (RF38)', async () => {
    await updateProfile({ startSemester: '2023-01-01' })

    expect((await getProgress()).totalHours).toBe(61)
  })
})

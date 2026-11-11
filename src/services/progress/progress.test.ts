import { beforeEach, describe, expect, it } from 'vitest'

import { resetActivitiesMock } from '../activities/activities.mock'
import { createActivity, removeActivity } from '../activities/activities.mutations'
import { resetProfileMock } from '../profile/profile.mock'
import { updateProfile } from '../profile/profile.mutations'
import { getProgress } from './progress.api'

function pdf(): File {
  return new File(['conteudo'], 'certificado.pdf', { type: 'application/pdf' })
}

describe('progress', () => {
  beforeEach(() => {
    resetActivitiesMock()
    resetProfileMock()
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

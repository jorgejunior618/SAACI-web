import { beforeEach, describe, expect, it } from 'vitest'

import { getProfile } from './profile.api'
import { CourseLockedError } from './profile.errors'
import { resetProfileMock, setRegisteredActivitiesMock } from './profile.mock'
import { updateProfile } from './profile.mutations'

describe('perfil', () => {
  beforeEach(resetProfileMock)

  it('salva só os campos enviados', async () => {
    const profile = await updateProfile({ enrollmentId: '2023999999' })

    expect(profile).toMatchObject({ enrollmentId: '2023999999', name: 'Ana Beatriz Moura' })
    expect(await getProfile()).toEqual(profile)
  })

  it('apaga a matrícula com null', async () => {
    expect((await updateProfile({ enrollmentId: null })).enrollmentId).toBeNull()
  })

  it('recusa semestre que não começa em 1º de janeiro ou de julho', async () => {
    await expect(updateProfile({ startSemester: '2023-03-15' })).rejects.toThrow()
    await expect(updateProfile({ startSemester: '2024-01-01' })).resolves.toMatchObject({
      startSemester: '2024-01-01',
    })
  })

  it('trava a troca de curso com atividades lançadas (RF10)', async () => {
    await expect(updateProfile({ courseId: 'outro-curso' })).rejects.toBeInstanceOf(
      CourseLockedError,
    )
    expect((await getProfile()).courseId).toBe('engenharia-de-computacao')
  })

  it('libera a troca de curso sem atividades', async () => {
    setRegisteredActivitiesMock(0)

    await expect(updateProfile({ courseId: 'outro-curso' })).resolves.toMatchObject({
      courseId: 'outro-curso',
    })
  })
})

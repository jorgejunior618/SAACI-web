import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getActivities } from '@/services/activities'
import { getProgress } from '@/services/progress'
import type { Course, RuleItem } from '@/services/rules'

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

vi.mock('@/services/rules/rules.api', () => ({
  getCourse: () => Promise.resolve(rules.course),
  getRuleItems: () => Promise.resolve(rules.items),
}))

// O perfil mora no Supabase. Aqui ele é um objeto em memória, que o teste muda quando precisa.
const profileDb = vi.hoisted(() => ({
  profile: {
    name: 'Ana Beatriz Moura',
    enrollmentId: '2023104501',
    startSemester: '2023-07-01' as string | null,
    courseId: '3b1f6d2e-5a47-4c80-9e1b-7d0c2a4f8e11' as string | null,
  },
}))

vi.mock('@/services/profile/profile.api', () => ({
  getProfile: () => Promise.resolve(structuredClone(profileDb.profile)),
}))

describe('mocks dos domínios', () => {
  beforeEach(() => {
    profileDb.profile = {
      ...profileDb.profile,
      courseId: rules.courseId,
      startSemester: '2023-07-01',
    }
  })

  it('as atividades de exemplo somam o mesmo total do progresso de exemplo', async () => {
    const [activities, progresso] = await Promise.all([getActivities(), getProgress()])

    expect(activities.length).toBeGreaterThan(0)
    expect(activities.reduce((sum, a) => sum + a.countedHours, 0)).toBe(progresso.totalHours)
  })
})

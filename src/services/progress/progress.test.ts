import { beforeEach, describe, expect, it, vi } from 'vitest'

import { readActivitiesWithHours } from '../activities/activities.api'
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

type Seed = [id: number, name: string, item: number, quantity: number, start: string, end: string]

// As 9 atividades do protótipo (Atividades, "Atividade que não conta"), como linhas de `atividades`.
// Pelas regras do curso somam 59h. A última começa antes do ingresso (2023.2) e não conta.
const SEEDS: Seed[] = [
  [1, 'Curso de inglês intermediário', 6, 60, '2025-02-03', '2025-06-30'],
  [2, 'Curso de Git e GitHub', 7, 32, '2025-04-07', '2025-05-03'],
  [3, 'Curso de Python para análise de dados', 7, 40, '2025-09-15', '2025-11-14'],
  [4, 'Semana de Engenharia de Computação 2025', 12, 3, '2025-09-17', '2025-09-19'],
  [5, 'Hackathon IFCE', 12, 1, '2026-03-08', '2026-03-08'],
  [6, 'Palestra sobre computação quântica', 13, 1, '2025-03-12', '2025-03-12'],
  [7, 'Palestra sobre IA em sistemas embarcados', 13, 1, '2025-09-20', '2025-09-20'],
  [8, 'Ciclo de Palestras Tech IFCE', 13, 3, '2026-10-20', '2026-10-22'],
  [9, 'Palestra de boas-vindas aos calouros', 13, 1, '2023-02-10', '2023-02-10'],
]

function toRow([n, nome, item, quantidade, inicio, fim]: Seed): Record<string, unknown> {
  return {
    id: `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`,
    nome,
    item_numero: item,
    quantidade,
    data_inicio: inicio,
    data_fim: fim,
    created_at: `${fim}T12:00:00.000000+00:00`,
    updated_at: `${fim}T12:00:00.000000+00:00`,
    comprovante_nome: `comprovante-${n}.pdf`,
    comprovante_tamanho: 700_000 + n * 1_000,
    comprovante_tipo: 'application/pdf',
  }
}

// O banco já devolve as linhas na ordem da lista. O cliente falso entrega `db.rows` a cada `select`.
const db = vi.hoisted(() => ({ rows: [] as Record<string, unknown>[] }))

vi.mock('@supabase/client', () => {
  const query = {
    select: () => query,
    order: () => query,
    then: (resolve: (value: { data: unknown; error: null }) => unknown) =>
      Promise.resolve({ data: db.rows, error: null }).then(resolve),
  }

  return { createClient: () => ({ from: () => query }) }
})

// O perfil mora no Supabase. Aqui ele é um objeto em memória, que o teste muda quando precisa.
const profileDb = vi.hoisted(() => ({
  profile: {
    name: 'Ana Beatriz Moura',
    enrollmentId: '2023104501',
    startSemester: '2023-07-01' as string | null,
    courseId: '3b1f6d2e-5a47-4c80-9e1b-7d0c2a4f8e11' as string | null,
  },
}))

vi.mock('../profile/profile.api', () => ({
  getProfile: () => Promise.resolve(structuredClone(profileDb.profile)),
}))

describe('progress', () => {
  beforeEach(() => {
    db.rows = SEEDS.map(toRow)
    profileDb.profile = {
      ...profileDb.profile,
      courseId: rules.courseId,
      startSemester: '2023-07-01',
    }
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

  it('o total é a soma das horas de cada atividade da lista', async () => {
    const [activities, progress] = await Promise.all([readActivitiesWithHours(), getProgress()])

    expect(activities.length).toBeGreaterThan(0)
    expect(activities.reduce((sum, a) => sum + a.countedHours, 0)).toBe(progress.totalHours)
  })

  it('uma atividade a mais muda o total', async () => {
    db.rows = [
      ...db.rows,
      toRow([10, 'Curso de React com TypeScript', 7, 40, '2026-08-03', '2026-09-12']),
    ]

    expect(await getProgress()).toMatchObject({ totalHours: 69, missingHours: 51 })
  })

  it('sem uma atividade, as horas dela saem do total', async () => {
    // a primeira seed é o curso de inglês, que conta 15h
    db.rows = db.rows.slice(1)

    expect((await getProgress()).totalHours).toBe(44)
  })

  it('mudar o semestre de ingresso muda o total (RF38)', async () => {
    profileDb.profile = { ...profileDb.profile, startSemester: '2023-01-01' }

    expect((await getProgress()).totalHours).toBe(61)
  })
})

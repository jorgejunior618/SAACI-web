import { describe, expect, it } from 'vitest'

import type { Activity } from '@/services/activities'
import type { Profile } from '@/services/profile'
import type { Progress } from '@/services/progress'
import type { RuleItem } from '@/services/rules'
import { buildFormRows } from '@/utils/coordination-form'

import {
  buildChecks,
  buildPreviewWarnings,
  countProofs,
  formatBlankRowsNote,
  formatOverflowNote,
  formatPendingTitle,
} from './utils'

function activity(status: Activity['status']): Activity {
  return {
    id: '00000000-0000-4000-8000-000000000001',
    name: 'Curso de inglês',
    itemNumber: 6,
    quantity: 4,
    startDate: '2025-01-01',
    endDate: '2025-01-02',
    registeredAt: '2025-01-02T12:00:00.000Z',
    updatedAt: '2025-01-02T12:00:00.000Z',
    activityHours: 1,
    countedHours: 1,
    status,
    reason: status === 'nao_conta' ? 'item_cheio' : null,
    proof: { fileName: 'comprovante.pdf', sizeBytes: 1_000, type: 'pdf' },
  }
}

function progress(over: Partial<Progress> = {}): Progress {
  return {
    totalHours: 120,
    targetHours: 120,
    missingHours: 0,
    itemsSum: 120,
    categories: [
      { itemNumber: 1, name: 'Iniciação', countedHours: 40, maxHours: 60, hoursOverLimit: 0 },
      { itemNumber: 7, name: 'Curso', countedHours: 60, maxHours: 60, hoursOverLimit: 0 },
    ],
    ...over,
  }
}

const completeProfile: Profile = {
  name: 'Ana Beatriz Moura',
  enrollmentId: '2023104501',
  startSemester: '2023-01-01',
  courseId: 'ec',
}

function ruleItem(itemNumber: number): RuleItem {
  return {
    itemNumber,
    name: `Item ${itemNumber}`,
    rule: '',
    ratio: { hours: 1, per: 4, unit: 'hora' },
    maxHours: 60,
  }
}

describe('buildChecks', () => {
  it('marca as quatro linhas como prontas com tudo preenchido', () => {
    const checks = buildChecks({
      progress: progress(),
      profile: completeProfile,
      activities: [activity('conta')],
    })

    expect(checks.map((check) => check.isDone)).toEqual([true, true, true, true])
    expect(checks[0]).toMatchObject({ title: '120h completas', actionLabel: 'Ver' })
    expect(checks[1]).toMatchObject({ title: 'Ana Beatriz Moura', href: '/perfil' })
    expect(checks[2]).toMatchObject({ title: 'Matrícula 2023104501' })
    expect(checks[3]).toMatchObject({ title: '1 comprovante separado' })
  })

  it('diz quantas horas faltam e quantas o aluno tem', () => {
    const [goal] = buildChecks({
      progress: progress({ totalHours: 59, missingHours: 61, itemsSum: 59 }),
      profile: completeProfile,
      activities: [activity('conta')],
    })

    expect(goal).toMatchObject({
      isDone: false,
      title: 'Faltam 61h para a meta de 120h',
      description: 'Você tem 59h. Registre mais atividades.',
      href: '/registrar',
    })
  })

  it('trata nome e matrícula vazios ou em branco como faltando', () => {
    const [, name, enrollment] = buildChecks({
      progress: progress(),
      profile: { ...completeProfile, name: '   ', enrollmentId: null },
      activities: [activity('conta')],
    })

    expect(name).toMatchObject({ isDone: false, actionLabel: 'Escrever', href: '/perfil' })
    expect(enrollment).toMatchObject({ isDone: false, actionLabel: 'Perfil', href: '/perfil' })
  })

  it('não conta como comprovante a atividade que não conta', () => {
    const [, , , proofs] = buildChecks({
      progress: progress(),
      profile: completeProfile,
      activities: [activity('nao_conta')],
    })

    expect(proofs).toMatchObject({ isDone: false, title: 'Nenhum comprovante conta ainda' })
  })
})

describe('countProofs', () => {
  it('conta quem conta inteiro ou em parte', () => {
    expect(countProofs([activity('conta'), activity('parcial'), activity('nao_conta')])).toBe(2)
  })
})

describe('formatPendingTitle', () => {
  const done = { isDone: true } as Parameters<typeof formatPendingTitle>[0][number]
  const missing = { isDone: false } as Parameters<typeof formatPendingTitle>[0][number]

  it('escreve o título pelo número de pendências', () => {
    expect(formatPendingTitle([done, done])).toBe('Tudo pronto')
    expect(formatPendingTitle([done, missing])).toBe('Falta 1 coisa')
    expect(formatPendingTitle([missing, missing, missing])).toBe('Faltam 3 coisas')
  })
})

describe('formatOverflowNote', () => {
  it('avisa quando a soma passa da meta', () => {
    expect(formatOverflowNote(progress({ itemsSum: 124 }))).toBe(
      'Seus itens somam 124h. O que passa de 120h não entra no pedido.',
    )
  })

  it('mantém a casa decimal que o cálculo devolveu', () => {
    expect(formatOverflowNote(progress({ itemsSum: 124.6 }))).toContain('124,6h')
  })

  it('fica quieto quando a soma não passa da meta', () => {
    expect(formatOverflowNote(progress({ itemsSum: 120 }))).toBeNull()
  })
})

describe('formatBlankRowsNote', () => {
  it('conta os itens sem hora no singular e no plural', () => {
    const rows = buildFormRows([ruleItem(1), ruleItem(2), ruleItem(3)], progress())

    expect(formatBlankRowsNote(rows)).toBe('2 itens sem horas ficam com traço')
    expect(formatBlankRowsNote(rows.slice(0, 2))).toBe('1 item sem horas fica com traço')
  })

  it('devolve null quando todos têm hora', () => {
    expect(formatBlankRowsNote(buildFormRows([ruleItem(1)], progress()))).toBeNull()
  })
})

describe('buildPreviewWarnings', () => {
  it('não avisa nada quando a meta está cumprida e o nome existe', () => {
    expect(buildPreviewWarnings({ progress: progress(), profile: completeProfile })).toEqual([])
  })

  it('avisa que faltam horas e que a coordenação pode recusar, sem bloquear', () => {
    expect(
      buildPreviewWarnings({
        progress: progress({ totalHours: 59, missingHours: 61, itemsSum: 59 }),
        profile: completeProfile,
      }),
    ).toEqual([
      'Você tem 59h de 120h. A coordenação pode recusar um pedido incompleto. Confirme com ela antes de entregar.',
    ])
  })

  it('avisa do nome em branco, mas não da matrícula, que o Perfil trata como opcional', () => {
    const warnings = buildPreviewWarnings({
      progress: progress(),
      profile: { ...completeProfile, name: '  ', enrollmentId: null },
    })

    expect(warnings).toEqual([
      'O nome está em branco no formulário. Escreva o nome no Perfil antes de baixar.',
    ])
  })

  it('põe as horas antes do nome', () => {
    const warnings = buildPreviewWarnings({
      progress: progress({ totalHours: 59, missingHours: 61 }),
      profile: { ...completeProfile, name: null },
    })

    expect(warnings).toHaveLength(2)
    expect(warnings[0]).toContain('Você tem 59h')
  })
})

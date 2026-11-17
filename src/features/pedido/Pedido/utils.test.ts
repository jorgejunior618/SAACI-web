import { PDFDocument } from 'pdf-lib'
import { describe, expect, it } from 'vitest'

import type { Activity } from '@/services/activities'
import type { Profile } from '@/services/profile'
import type { Progress } from '@/services/progress'
import type { RuleItem } from '@/services/rules'

import {
  buildChecks,
  buildFileName,
  buildFormPdf,
  buildFormRows,
  countProofs,
  formatBlankRowsNote,
  formatFormHeader,
  formatGeneratedAt,
  formatKilobytes,
  formatOverflowNote,
  formatPendingTitle,
  PdfCharacterError,
} from './utils'
import type { FormPdfInput } from './utils'

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

describe('buildFormRows', () => {
  it('lista todos os itens do curso, com traço nos que não têm hora', () => {
    const rows = buildFormRows([ruleItem(1), ruleItem(2), ruleItem(7)], progress())

    expect(rows).toEqual([
      { itemNumber: 1, name: 'Item 1', hours: 40 },
      { itemNumber: 2, name: 'Item 2', hours: null },
      { itemNumber: 7, name: 'Item 7', hours: 60 },
    ])
  })

  it('trata item com 0h como sem hora', () => {
    const rows = buildFormRows(
      [ruleItem(1)],
      progress({
        categories: [
          { itemNumber: 1, name: 'Iniciação', countedHours: 0, maxHours: 60, hoursOverLimit: 5 },
        ],
      }),
    )

    expect(rows[0].hours).toBeNull()
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

describe('formatGeneratedAt', () => {
  it('escreve dia, mês, ano, hora e minuto com dois dígitos', () => {
    expect(formatGeneratedAt(new Date(2026, 9, 31, 15, 30))).toBe('31/10/2026, 15:30')
    expect(formatGeneratedAt(new Date(2026, 0, 5, 8, 5))).toBe('05/01/2026, 08:05')
  })
})

describe('buildFileName', () => {
  it('usa o primeiro e o último nome, sem acento', () => {
    expect(buildFileName('Ana Beatriz Moura')).toBe(
      'formulario-atividades-complementares-ana-moura.pdf',
    )
    expect(buildFileName('João Gonçalves')).toBe(
      'formulario-atividades-complementares-joao-goncalves.pdf',
    )
  })

  it('aceita nome de uma palavra só', () => {
    expect(buildFileName('Ana')).toBe('formulario-atividades-complementares-ana.pdf')
  })

  it('marca a versão em branco quando não há nome', () => {
    expect(buildFileName(null)).toBe('formulario-atividades-complementares-em-branco.pdf')
    expect(buildFileName('  ')).toBe('formulario-atividades-complementares-em-branco.pdf')
  })
})

describe('formatFormHeader', () => {
  it('junta o campus e a coordenação do curso', () => {
    expect(formatFormHeader({ campus: 'Fortaleza', name: 'Engenharia de Computação' })).toBe(
      'IFCE campus Fortaleza · Coordenação de Engenharia de Computação',
    )
  })
})

describe('formatKilobytes', () => {
  it('arredonda para KB e nunca mostra 0 KB para arquivo com conteúdo', () => {
    expect(formatKilobytes(184_320)).toBe('180 KB')
    expect(formatKilobytes(10)).toBe('1 KB')
    expect(formatKilobytes(0)).toBe('0 KB')
  })
})

describe('buildFormPdf', () => {
  const input: FormPdfInput = {
    header: 'IFCE campus Fortaleza · Coordenação de Engenharia de Computação',
    studentName: 'Ana Beatriz Moura',
    enrollmentId: '2023104501',
    rows: buildFormRows([ruleItem(1), ruleItem(2), ruleItem(7)], progress()),
    totalHours: 120,
    generatedAt: '31/10/2026, 15:30',
  }

  async function load(blob: Blob): Promise<PDFDocument> {
    return PDFDocument.load(new Uint8Array(await blob.arrayBuffer()))
  }

  it('gera um PDF de uma página com o título do formulário', async () => {
    const blob = await buildFormPdf(input)
    const bytes = new Uint8Array(await blob.arrayBuffer())
    const pdf = await load(blob)

    expect(blob.type).toBe('application/pdf')
    expect(new TextDecoder().decode(bytes.slice(0, 5))).toBe('%PDF-')
    expect(pdf.getPageCount()).toBe(1)
    expect(pdf.getTitle()).toBe('Formulário para Solicitação de Atividades Complementares')
  })

  it('segue a tabela em outra página quando os itens não cabem', async () => {
    const manyRows = buildFormRows(
      Array.from({ length: 60 }, (_, index) => ruleItem(index + 1)),
      progress(),
    )
    const pdf = await load(await buildFormPdf({ ...input, rows: manyRows }))

    expect(pdf.getPageCount()).toBeGreaterThan(1)
  })

  it('gera a versão em branco', async () => {
    const blob = await buildFormPdf({ ...input, isBlank: true })

    expect(blob.type).toBe('application/pdf')
    expect((await load(blob)).getPageCount()).toBe(1)
  })

  it('aceita acentos do português', async () => {
    await expect(
      buildFormPdf({ ...input, studentName: 'João Conceição Ávila' }),
    ).resolves.toBeInstanceOf(Blob)
  })

  it('recusa com um erro próprio o caractere que a fonte não tem', async () => {
    await expect(buildFormPdf({ ...input, studentName: '山田 太郎' })).rejects.toBeInstanceOf(
      PdfCharacterError,
    )
  })
})

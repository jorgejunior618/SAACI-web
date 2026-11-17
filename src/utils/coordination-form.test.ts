import { PDFDocument } from 'pdf-lib'
import { describe, expect, it } from 'vitest'

import type { Progress } from '@/services/progress'
import type { RuleItem } from '@/services/rules'

import {
  buildFileName,
  buildFormPdf,
  buildFormRows,
  formatFormHeader,
  formatGeneratedAt,
  PdfCharacterError,
} from './coordination-form'
import type { FormPdfInput } from './coordination-form'

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

function ruleItem(itemNumber: number): RuleItem {
  return {
    itemNumber,
    name: `Item ${itemNumber}`,
    rule: '',
    ratio: { hours: 1, per: 4, unit: 'hora' },
    maxHours: 60,
  }
}

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

  it('marca a versão em branco, tenha o aluno nome ou não', () => {
    expect(buildFileName(null, true)).toBe('formulario-atividades-complementares-em-branco.pdf')
    expect(buildFileName('Ana Moura', true)).toBe(
      'formulario-atividades-complementares-em-branco.pdf',
    )
  })

  it('não diz que está em branco quando o PDF é preenchido e o nome ainda falta', () => {
    expect(buildFileName(null)).toBe('formulario-atividades-complementares.pdf')
    expect(buildFileName('  ')).toBe('formulario-atividades-complementares.pdf')
  })
})

describe('formatFormHeader', () => {
  it('junta o campus e a coordenação do curso', () => {
    expect(formatFormHeader({ campus: 'Fortaleza', name: 'Engenharia de Computação' })).toBe(
      'IFCE campus Fortaleza · Coordenação de Engenharia de Computação',
    )
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

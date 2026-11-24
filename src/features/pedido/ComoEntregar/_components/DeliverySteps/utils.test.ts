// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import { describe, expect, it } from 'vitest'

import { buildProtocolEmail, PROTOCOL_EMAIL } from './utils'

const student = {
  name: 'Ana Beatriz Moura',
  enrollmentId: '2023104501',
  courseName: 'Engenharia de Computação',
  totalHours: 120,
}

describe('buildProtocolEmail', () => {
  it('monta destinatário, assunto e corpo com os dados do aluno', () => {
    const email = buildProtocolEmail(student)

    expect(email.to).toBe(PROTOCOL_EMAIL)
    expect(email.subject).toBe(
      'Solicitação de atividades complementares - Ana Beatriz Moura - 2023104501',
    )
    expect(email.body).toContain('Aluno: Ana Beatriz Moura')
    expect(email.body).toContain('Matrícula: 2023104501')
    expect(email.body).toContain('Curso: Engenharia de Computação')
    expect(email.body).toContain('Carga horária solicitada: 120h')
    expect(email.body).toContain('Seguem em anexo o formulário preenchido e os comprovantes.')
  })

  it('gera um mailto que volta ao mesmo texto, com quebra de linha de e-mail', () => {
    const { mailtoHref, subject, body } = buildProtocolEmail(student)
    const url = new URL(mailtoHref)

    expect(url.protocol).toBe('mailto:')
    expect(decodeURIComponent(url.pathname)).toBe(PROTOCOL_EMAIL)
    expect(url.searchParams.get('subject')).toBe(subject)
    expect(url.searchParams.get('body')).toBe(body.replace(/\n/g, '\r\n'))
  })

  it('tira do texto o nome e a matrícula que faltam, sem deixar campo vazio', () => {
    const email = buildProtocolEmail({ ...student, name: null, enrollmentId: '  ' })

    expect(email.subject).toBe('Solicitação de atividades complementares')
    expect(email.body).not.toContain('Aluno:')
    expect(email.body).not.toContain('Matrícula:')
    expect(email.body.endsWith('Atenciosamente,')).toBe(true)
  })

  it('devolve também o texto inteiro para copiar', () => {
    const { plainText, subject, body } = buildProtocolEmail(student)

    expect(plainText).toBe(`Para: ${PROTOCOL_EMAIL}\nAssunto: ${subject}\n\n${body}`)
  })
})

// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import { formatHours } from '@/utils/format-hours'

/** E-mail do protocolo do campus, por onde o aluno abre o pedido e acompanha a resposta. */
export const PROTOCOL_EMAIL = 'protocolo.fortaleza@ifce.edu.br'

/** Dados do aluno que entram no e-mail para o protocolo. */
export type ProtocolEmailInput = {
  /** `null` quando o aluno ainda não escreveu o nome no Perfil. A linha some do texto. */
  name: string | null
  /** `null` quando a matrícula não foi informada. A linha some do texto. */
  enrollmentId: string | null
  courseName: string
  /** Total do progresso, o mesmo número do formulário. */
  totalHours: number
}

/** E-mail pronto para o protocolo, em duas formas: link para abrir o app de e-mail e texto para copiar. */
export type ProtocolEmail = {
  to: string
  subject: string
  body: string
  /** Link `mailto:` com destinatário, assunto e corpo preenchidos. Não leva anexo. */
  mailtoHref: string
  /** Destinatário, assunto e corpo juntos, para o aluno colar onde quiser. */
  plainText: string
}

/**
 * Monta o e-mail que o aluno manda ao protocolo, já com os dados do pedido.
 *
 * @remarks
 * O link `mailto:` não anexa arquivo: o aluno anexa o formulário e o arquivo dos comprovantes antes
 * de enviar, e o texto do passo avisa isso. O corpo usa quebra de linha `\r\n`, que é o que os apps
 * de e-mail esperam no `mailto:`. Nome e matrícula que faltam saem do texto, sem deixar campo vazio.
 *
 * @param input Dados do aluno e do curso.
 * @returns O e-mail nas duas formas.
 *
 * @example
 * ```ts
 * buildProtocolEmail({ name: 'Ana Moura', enrollmentId: '2023104501', courseName: 'Engenharia de Computação', totalHours: 120 }).subject
 * // "Solicitação de atividades complementares - Ana Moura - 2023104501"
 * ```
 */
export function buildProtocolEmail({
  name,
  enrollmentId,
  courseName,
  totalHours,
}: ProtocolEmailInput): ProtocolEmail {
  const studentName = name?.trim() ?? ''
  const enrollment = enrollmentId?.trim() ?? ''

  const subject = ['Solicitação de atividades complementares', studentName, enrollment]
    .filter(Boolean)
    .join(' - ')

  const body = [
    'Olá,',
    '',
    'Peço a abertura de um protocolo para a solicitação de atividades complementares.',
    '',
    studentName ? `Aluno: ${studentName}` : null,
    enrollment ? `Matrícula: ${enrollment}` : null,
    `Curso: ${courseName}`,
    `Carga horária solicitada: ${formatHours(totalHours, { fractionDigits: 0 })}`,
    '',
    'Seguem em anexo o formulário preenchido e os comprovantes.',
    '',
    'Atenciosamente,',
    studentName || null,
  ]
    .filter((line): line is string => line !== null)
    .join('\n')

  const mailtoHref = `mailto:${PROTOCOL_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body.replace(/\n/g, '\r\n'))}`

  return {
    to: PROTOCOL_EMAIL,
    subject,
    body,
    mailtoHref,
    plainText: `Para: ${PROTOCOL_EMAIL}\nAssunto: ${subject}\n\n${body}`,
  }
}

// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import * as v from 'valibot'

const SEMESTER_PATTERN = /^(\d{4})\.([12])$/

/** Converte "2023.2" em "2023-07-01". Só recebe texto que já passou no `SEMESTER_PATTERN`. */
function toIsoDate(text: string): string {
  const [year, term] = text.split('.')

  return `${year}-${term === '1' ? '01' : '07'}-01`
}

/** Hoje como `AAAA-MM-DD` no fuso do aparelho, para a virada do dia valer para quem digita. */
function getToday(): string {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')

  return `${now.getFullYear()}-${month}-${day}`
}

/** Diz se o semestre começa depois de hoje. Compara texto `AAAA-MM-DD`, que ordena como data. */
function startsInFuture(text: string): boolean {
  return toIsoDate(text) > getToday()
}

/**
 * Campo de semestre de início, usado em Seu curso e no Perfil.
 *
 * @remarks
 * A pessoa digita `AAAA.1` ou `AAAA.2`. A saída é o dia 1 de janeiro ou de julho, no formato que o
 * `updateProfile` aceita em `startSemester`. Semestre que ainda não começou é recusado, porque
 * ninguém entrou nele.
 */
export const StartSemesterFormSchema = v.pipe(
  v.string(),
  v.trim(),
  v.nonEmpty('Digite o ano e o semestre, como 2023.2.'),
  v.regex(SEMESTER_PATTERN, 'Use o ano, um ponto e o número 1 ou 2, como 2023.2.'),
  v.check(
    (text) => !startsInFuture(text),
    'Esse semestre ainda não começou. Digite o semestre em que você entrou.',
  ),
  v.transform(toIsoDate),
)

/** Semestre como a pessoa digita, antes da validação. */
export type StartSemesterInput = v.InferInput<typeof StartSemesterFormSchema>
/** Semestre depois da validação, como data `AAAA-MM-DD` de 1º de janeiro ou de julho. */
export type StartSemesterOutput = v.InferOutput<typeof StartSemesterFormSchema>

/**
 * Escreve o semestre de início como a pessoa o digita, o inverso do schema do formulário.
 *
 * @param isoDate Data `AAAA-MM-DD` de 1º de janeiro ou de julho, como o perfil guarda.
 * @returns O semestre no formato `AAAA.1` ou `AAAA.2`.
 *
 * @example
 * formatSemester('2023-07-01') // '2023.2'
 */
export function formatSemester(isoDate: string): string {
  const year = isoDate.slice(0, 4)
  const month = isoDate.slice(5, 7)

  return `${year}.${month === '01' ? '1' : '2'}`
}

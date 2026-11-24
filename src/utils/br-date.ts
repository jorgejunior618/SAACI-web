// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

const BR_DATE = /^(\d{2})\/(\d{2})\/(\d{4})$/
const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/

/**
 * Converte uma data digitada em dd/mm/aaaa para o formato ISO (aaaa-mm-dd).
 *
 * @param text Data como a pessoa digitou.
 * @returns A data ISO, ou `null` quando o formato está errado ou a data não existe (31/02).
 *
 * @example
 * ```ts
 * parseBrDate('12/09/2026') // '2026-09-12'
 * parseBrDate('31/02/2026') // null
 * ```
 */
export function parseBrDate(text: string): string | null {
  const match = BR_DATE.exec(text.trim())

  if (!match) return null
  const [, day, month, year] = match
  const iso = `${year}-${month}-${day}`
  const date = new Date(`${iso}T00:00:00Z`)

  // `Date` aceita 31/02 e pula para março: conferir o dia de volta pega a data que não existe.
  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== iso ? null : iso
}

/**
 * Escreve uma data ISO (aaaa-mm-dd) como dd/mm/aaaa, para preencher o campo ou mostrar a data.
 *
 * @param iso Data ISO.
 * @returns A data em dd/mm/aaaa. Texto fora do formato ISO volta como veio.
 */
export function formatBrDate(iso: string): string {
  const match = ISO_DATE.exec(iso)

  return match ? `${match[3]}/${match[2]}/${match[1]}` : iso
}

/**
 * Põe as barras da data enquanto a pessoa digita, aceitando só números.
 *
 * @param text Texto do campo depois da última tecla.
 * @returns Até 8 dígitos no formato dd/mm/aaaa, parcial enquanto falta dígito ("12/09").
 *
 * @example
 * ```ts
 * maskBrDate('12092026') // '12/09/2026'
 * maskBrDate('120') // '12/0'
 * ```
 */
export function maskBrDate(text: string): string {
  const digits = text.replace(/\D/g, '').slice(0, 8)

  return [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)].filter(Boolean).join('/')
}

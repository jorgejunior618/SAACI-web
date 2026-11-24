// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

/**
 * Segundos de espera antes de o link de confirmação poder ser reenviado. Valor ainda a validar com
 * a equipe.
 */
export const RESEND_SECONDS = 60

/**
 * Formata os segundos que faltam como minutos e segundos ("0:45").
 *
 * @param seconds Segundos restantes. Valor negativo conta como zero.
 * @returns Texto no formato `m:ss`.
 */
export function formatCountdown(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds))

  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`
}

// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import type { ProofSuggestion } from '@/services/activities'
import type { ActivityFormInput } from '@/utils/activity-form'
import { formatBrDate } from '@/utils/br-date'

/**
 * Transforma a sugestão da leitura nos valores do formulário. Campo não lido fica em branco.
 *
 * @param suggestion O que `readProof` devolveu.
 * @returns Os valores para o `reset` do formulário.
 */
export function suggestionToForm(suggestion: ProofSuggestion): ActivityFormInput {
  return {
    name: suggestion.name ?? '',
    quantity: suggestion.quantity === null ? '' : String(suggestion.quantity).replace('.', ','),
    startDate: suggestion.startDate === null ? '' : formatBrDate(suggestion.startDate),
    endDate: suggestion.endDate === null ? '' : formatBrDate(suggestion.endDate),
  }
}

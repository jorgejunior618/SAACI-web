// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import * as v from 'valibot'

/**
 * Campos do formulário de Excluir conta.
 *
 * @remarks
 * A senha é pedida de novo para confirmar. Quem diz se ela confere é `deleteAccount`, não o schema.
 */
export const DeleteAccountSchema = v.object({
  password: v.pipe(v.string(), v.nonEmpty('Digite sua senha para confirmar.')),
})

/** Valores do formulário de Excluir conta como a pessoa digita, antes da validação. */
export type DeleteAccountInput = v.InferInput<typeof DeleteAccountSchema>
/** Valores do formulário de Excluir conta depois da validação. */
export type DeleteAccountOutput = v.InferOutput<typeof DeleteAccountSchema>

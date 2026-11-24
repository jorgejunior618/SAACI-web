// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import * as v from 'valibot'

/** Horas de um item do formulário no total do aluno. */
export const ProgressCategorySchema = v.object({
  itemNumber: v.pipe(v.number(), v.integer(), v.minValue(1)),
  name: v.string(),
  /** Horas que contam no total, já limitadas ao máximo do item. */
  countedHours: v.number(),
  maxHours: v.number(),
  /** Horas registradas que passaram do máximo do item e ficaram de fora. */
  hoursOverLimit: v.number(),
})

export type ProgressCategory = v.InferOutput<typeof ProgressCategorySchema>

/**
 * Progresso do aluno até a meta do curso. É o número que painel, resumo e formulário mostram.
 *
 * @remarks
 * Quem calcula é um lugar só (RNF20). A tela nunca soma `categorias` por conta própria, porque o
 * total é arredondado para baixo em horas inteiras (RF14) e o resultado da soma pode diferir.
 */
export const ProgressSchema = v.object({
  /** Horas inteiras que contam, arredondadas para baixo. */
  totalHours: v.pipe(v.number(), v.integer(), v.minValue(0)),
  targetHours: v.number(),
  /** `targetHours` menos `totalHours`, nunca negativo. */
  missingHours: v.pipe(v.number(), v.minValue(0)),
  /** Soma dos itens antes de limitar à meta. Passa de `targetHours` quando o aluno completou. */
  itemsSum: v.number(),
  /** Só os itens com horas, na ordem do formulário. */
  categories: v.array(ProgressCategorySchema),
})

export type Progress = v.InferOutput<typeof ProgressSchema>

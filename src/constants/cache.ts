// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

/**
 * Tempo, em milissegundos, que um dado buscado conta como atual antes de ser buscado de novo.
 * Use sempre uma destas chaves no `staleTime` da query, nunca um número solto.
 *
 * @remarks
 * Com `calculo: 0`, o dado hidratado do servidor nasce vencido e é buscado de novo no primeiro
 * mount. É de propósito: horas computadas não podem ficar velhas na tela.
 *
 * - `cadastro`: 5 min. Regra do curso, cadastro e sessão.
 * - `operacional`: 30 s. Lista que o aluno altera.
 * - `calculo`: 0. Horas computadas e totais.
 */
export const STALE_TIME = {
  cadastro: 5 * 60_000,
  operacional: 30_000,
  calculo: 0,
} as const

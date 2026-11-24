// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

/**
 * Prazo, em dias, para os dados do aluno saírem de todos os sistemas depois que ele apaga a conta
 * (RNF05, ADR 0017).
 *
 * @remarks
 * Vale para o banco, os arquivos do Storage e as cópias de segurança. É o teto, não o ritmo normal:
 * o banco apaga na hora. Telas que citam o prazo leem esta constante, para não divergirem.
 */
export const ACCOUNT_DELETION_DEADLINE_DAYS = 7

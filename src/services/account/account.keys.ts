// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

/** Chaves de cache do domínio `account`. */
export const accountKeys = {
  all: ['account'] as const,
  session: () => [...accountKeys.all, 'session'] as const,
  passwordLink: (token: string) => [...accountKeys.all, 'password-link', token] as const,
}

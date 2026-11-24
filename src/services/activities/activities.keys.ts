// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

/** Chaves de cache do domínio `activities`. */
export const activitiesKeys = {
  all: ['activities'] as const,
  lists: () => [...activitiesKeys.all, 'list'] as const,
  list: () => [...activitiesKeys.lists()] as const,
  detail: (id: string) => [...activitiesKeys.all, 'detail', id] as const,
}

// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

/** Chaves de cache do domínio `rules`. */
export const rulesKeys = {
  all: ['rules'] as const,
  courses: (search: string) => [...rulesKeys.all, 'courses', search] as const,
  course: (id: string) => [...rulesKeys.all, 'course', id] as const,
  items: (courseId: string) => [...rulesKeys.all, 'items', courseId] as const,
}

// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import type { DbClient } from '@supabase/client'
import { queryOptions } from '@tanstack/react-query'

import { STALE_TIME } from '@/constants/cache'

import { getCourse, getCourses, getRuleItems } from './rules.api'
import { rulesKeys } from './rules.keys'

/**
 * Definições de query do domínio `rules`. Regra de curso muda por migration, então é cadastro.
 *
 * @remarks
 * Cada definição aceita o `db` do servidor para o prefetch das páginas. Sem ele, usa o cliente do
 * navegador, como as telas fazem.
 */
export const rulesQueries = {
  courses: (search = '', db?: DbClient) =>
    // `db` é o cliente (servidor ou navegador), não o dado: na chave, o cache hidratado nunca casaria.
    // eslint-disable-next-line @tanstack/query/exhaustive-deps -- o cliente não identifica o dado
    queryOptions({
      queryKey: rulesKeys.courses(search),
      queryFn: () => getCourses(search, db),
      staleTime: STALE_TIME.cadastro,
    }),
  course: (id: string, db?: DbClient) =>
    // eslint-disable-next-line @tanstack/query/exhaustive-deps -- o cliente não identifica o dado
    queryOptions({
      queryKey: rulesKeys.course(id),
      queryFn: () => getCourse(id, db),
      staleTime: STALE_TIME.cadastro,
    }),
  items: (courseId: string, db?: DbClient) =>
    // eslint-disable-next-line @tanstack/query/exhaustive-deps -- o cliente não identifica o dado
    queryOptions({
      queryKey: rulesKeys.items(courseId),
      queryFn: () => getRuleItems(courseId, db),
      staleTime: STALE_TIME.cadastro,
    }),
}

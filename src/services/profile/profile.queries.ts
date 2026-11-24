// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import type { DbClient } from '@supabase/client'
import { queryOptions } from '@tanstack/react-query'

import { STALE_TIME } from '@/constants/cache'

import { getProfile } from './profile.api'
import { profileKeys } from './profile.keys'

/**
 * Definições de query do domínio `profile`.
 *
 * @remarks
 * `detail` aceita o `db` do servidor para o prefetch das páginas. Sem ele, usa o cliente do
 * navegador, como as telas fazem.
 */
export const profileQueries = {
  detail: (db?: DbClient) =>
    // `db` é o cliente (servidor ou navegador), não o dado: na chave, o cache hidratado nunca casaria.
    // eslint-disable-next-line @tanstack/query/exhaustive-deps -- o cliente não identifica o dado
    queryOptions({
      queryKey: profileKeys.detail(),
      queryFn: () => getProfile(db),
      staleTime: STALE_TIME.cadastro,
    }),
}

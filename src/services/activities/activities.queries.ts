import type { DbClient } from '@supabase/client'
import { queryOptions } from '@tanstack/react-query'

import { STALE_TIME } from '@/constants/cache'

import { getActivities, getActivity } from './activities.api'
import { activitiesKeys } from './activities.keys'

/**
 * Definições de query do domínio `activities`. Lista que o aluno altera, então é operacional.
 *
 * @remarks
 * Cada definição aceita o `db` do servidor para o prefetch das páginas. Sem ele, usa o cliente do
 * navegador, como as telas fazem.
 */
export const activitiesQueries = {
  list: (db?: DbClient) =>
    // `db` é o cliente (servidor ou navegador), não o dado: na chave, o cache hidratado nunca casaria.
    // eslint-disable-next-line @tanstack/query/exhaustive-deps -- o cliente não identifica o dado
    queryOptions({
      queryKey: activitiesKeys.list(),
      // Em arrow: o TanStack passa o contexto da query como 1º argumento, que viraria o `db`.
      queryFn: () => getActivities(db),
      staleTime: STALE_TIME.operacional,
    }),
  detail: (id: string, db?: DbClient) =>
    // eslint-disable-next-line @tanstack/query/exhaustive-deps -- o cliente não identifica o dado
    queryOptions({
      queryKey: activitiesKeys.detail(id),
      queryFn: () => getActivity(id, db),
      staleTime: STALE_TIME.operacional,
    }),
}

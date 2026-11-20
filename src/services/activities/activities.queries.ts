import { queryOptions } from '@tanstack/react-query'

import { STALE_TIME } from '@/constants/cache'

import { getActivities, getActivity } from './activities.api'
import { activitiesKeys } from './activities.keys'

/** Definições de query do domínio `activities`. Lista que o aluno altera, então é operacional. */
export const activitiesQueries = {
  list: () =>
    queryOptions({
      queryKey: activitiesKeys.list(),
      // Em arrow: o TanStack passa o contexto da query como 1º argumento, que viraria o `db`.
      queryFn: () => getActivities(),
      staleTime: STALE_TIME.operacional,
    }),
  detail: (id: string) =>
    queryOptions({
      queryKey: activitiesKeys.detail(id),
      queryFn: () => getActivity(id),
      staleTime: STALE_TIME.operacional,
    }),
}

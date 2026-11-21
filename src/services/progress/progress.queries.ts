import { queryOptions } from '@tanstack/react-query'

import { STALE_TIME } from '@/constants/cache'

import { getProgress } from './progress.api'
import { progressKeys } from './progress.keys'

/** Definições de query do domínio `progress`. Horas computadas nunca ficam velhas na tela. */
export const progressQueries = {
  summary: () =>
    queryOptions({
      queryKey: progressKeys.summary(),
      // Em arrow: o TanStack passa o contexto da query como 1º argumento, que viraria o `db`.
      queryFn: () => getProgress(),
      staleTime: STALE_TIME.calculo,
    }),
}

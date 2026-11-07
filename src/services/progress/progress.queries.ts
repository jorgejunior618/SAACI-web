import { queryOptions } from '@tanstack/react-query'

import { STALE_TIME } from '@/constants/cache'

import { getProgress } from './progress.api'
import { progressKeys } from './progress.keys'

/** Definições de query do domínio `progress`. Horas computadas nunca ficam velhas na tela. */
export const progressQueries = {
  summary: () =>
    queryOptions({
      queryKey: progressKeys.summary(),
      queryFn: getProgress,
      staleTime: STALE_TIME.calculo,
    }),
}

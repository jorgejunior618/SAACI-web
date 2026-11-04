import { queryOptions } from '@tanstack/react-query'

import { STALE_TIME } from '@/constants/cache'

import { getProgresso } from './progresso.api'
import { progressoKeys } from './progresso.keys'

export const progressoQueries = {
  resumo: () =>
    queryOptions({
      queryKey: progressoKeys.all,
      queryFn: getProgresso,
      staleTime: STALE_TIME.calculo,
    }),
}

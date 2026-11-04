import { queryOptions } from '@tanstack/react-query'

import { STALE_TIME } from '@/constants/cache'

import { getSessao } from './conta.api'
import { contaKeys } from './conta.keys'

export const contaQueries = {
  sessao: () =>
    queryOptions({
      queryKey: contaKeys.sessao(),
      queryFn: getSessao,
      staleTime: STALE_TIME.cadastro,
    }),
}

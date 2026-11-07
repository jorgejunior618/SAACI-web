import { queryOptions } from '@tanstack/react-query'

import { STALE_TIME } from '@/constants/cache'

import { getSession } from './account.api'
import { accountKeys } from './account.keys'

/** Definições de query do domínio `account`. */
export const accountQueries = {
  session: () =>
    queryOptions({
      queryKey: accountKeys.session(),
      queryFn: getSession,
      staleTime: STALE_TIME.cadastro,
    }),
}

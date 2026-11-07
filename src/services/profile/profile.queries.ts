import { queryOptions } from '@tanstack/react-query'

import { STALE_TIME } from '@/constants/cache'

import { getProfile } from './profile.api'
import { profileKeys } from './profile.keys'

/** Definições de query do domínio `profile`. */
export const profileQueries = {
  detail: () =>
    queryOptions({
      queryKey: profileKeys.detail(),
      queryFn: getProfile,
      staleTime: STALE_TIME.cadastro,
    }),
}

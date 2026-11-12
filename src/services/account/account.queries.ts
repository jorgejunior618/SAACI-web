import { queryOptions } from '@tanstack/react-query'

import { STALE_TIME } from '@/constants/cache'

import { getPasswordLink, getSession } from './account.api'
import { accountKeys } from './account.keys'

/** Definições de query do domínio `account`. */
export const accountQueries = {
  session: () =>
    queryOptions({
      queryKey: accountKeys.session(),
      queryFn: getSession,
      staleTime: STALE_TIME.cadastro,
    }),
  /** Link de nova senha, lido sem gastar. `data` é `null` quando o link não vale. */
  passwordLink: (token: string) =>
    queryOptions({
      queryKey: accountKeys.passwordLink(token),
      queryFn: () => getPasswordLink(token),
      staleTime: STALE_TIME.operacional,
    }),
}

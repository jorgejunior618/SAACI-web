import type { DbClient } from '@supabase/client'
import { queryOptions } from '@tanstack/react-query'

import { STALE_TIME } from '@/constants/cache'

import { getPasswordLink, getSession } from './account.api'
import { accountKeys } from './account.keys'

/**
 * Definições de query do domínio `account`.
 *
 * @remarks
 * `session` aceita o `db` do servidor para o prefetch das páginas. Sem ele, usa o cliente do
 * navegador, como as telas fazem.
 */
export const accountQueries = {
  session: (db?: DbClient) =>
    // `db` é o cliente (servidor ou navegador), não o dado: na chave, o cache hidratado nunca casaria.
    // eslint-disable-next-line @tanstack/query/exhaustive-deps -- o cliente não identifica o dado
    queryOptions({
      queryKey: accountKeys.session(),
      // Função de seta: o `queryFn` recebe o contexto da query, que não pode cair no parâmetro `db`.
      queryFn: () => getSession(db),
      staleTime: STALE_TIME.cadastro,
    }),
  /**
   * Link de nova senha. A conferência gasta o token no Auth e abre uma sessão curta, que
   * `updatePassword` usa; uma segunda leitura cai nessa sessão. `data` é `null` quando o link não
   * vale.
   */
  passwordLink: (token: string) =>
    queryOptions({
      queryKey: accountKeys.passwordLink(token),
      queryFn: () => getPasswordLink(token),
      staleTime: STALE_TIME.operacional,
    }),
}

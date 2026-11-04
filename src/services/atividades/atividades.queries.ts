import { queryOptions } from '@tanstack/react-query'

import { STALE_TIME } from '@/constants/cache'

import { getAtividade, getAtividades } from './atividades.api'
import { atividadesKeys } from './atividades.keys'

export const atividadesQueries = {
  list: () =>
    queryOptions({
      queryKey: atividadesKeys.lists(),
      queryFn: getAtividades,
      staleTime: STALE_TIME.operacional,
    }),
  detail: (id: string) =>
    queryOptions({
      queryKey: atividadesKeys.detail(id),
      queryFn: () => getAtividade(id),
      staleTime: STALE_TIME.operacional,
    }),
}

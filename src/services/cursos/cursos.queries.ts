import { queryOptions } from '@tanstack/react-query'

import { STALE_TIME } from '@/constants/cache'

import { getCursos } from './cursos.api'
import { cursosKeys } from './cursos.keys'

export const cursosQueries = {
  list: (busca: string) =>
    queryOptions({
      queryKey: cursosKeys.list(busca),
      queryFn: () => getCursos(busca),
      staleTime: STALE_TIME.cadastro,
    }),
}

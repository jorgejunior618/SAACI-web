import { queryOptions } from '@tanstack/react-query'

import { STALE_TIME } from '@/constants/cache'

import { getCourse, getCourses, getRuleItems } from './rules.api'
import { rulesKeys } from './rules.keys'

/** Definições de query do domínio `rules`. Regra de curso muda por migration, então é cadastro. */
export const rulesQueries = {
  courses: (search = '') =>
    queryOptions({
      queryKey: rulesKeys.courses(search),
      queryFn: () => getCourses(search),
      staleTime: STALE_TIME.cadastro,
    }),
  course: (id: string) =>
    queryOptions({
      queryKey: rulesKeys.course(id),
      queryFn: () => getCourse(id),
      staleTime: STALE_TIME.cadastro,
    }),
  items: (courseId: string) =>
    queryOptions({
      queryKey: rulesKeys.items(courseId),
      queryFn: () => getRuleItems(courseId),
      staleTime: STALE_TIME.cadastro,
    }),
}

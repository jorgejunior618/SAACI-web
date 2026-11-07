/** Chaves de cache do domínio `activities`. */
export const activitiesKeys = {
  all: ['activities'] as const,
  lists: () => [...activitiesKeys.all, 'list'] as const,
  list: () => [...activitiesKeys.lists()] as const,
  detail: (id: string) => [...activitiesKeys.all, 'detail', id] as const,
}

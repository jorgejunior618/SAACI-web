export const cursosKeys = {
  all: ['cursos'] as const,
  lists: () => [...cursosKeys.all, 'list'] as const,
  list: (busca: string) => [...cursosKeys.lists(), busca] as const,
}

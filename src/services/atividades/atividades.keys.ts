export const atividadesKeys = {
  all: ['atividades'] as const,
  lists: () => [...atividadesKeys.all, 'list'] as const,
  details: () => [...atividadesKeys.all, 'detail'] as const,
  detail: (id: string) => [...atividadesKeys.details(), id] as const,
}

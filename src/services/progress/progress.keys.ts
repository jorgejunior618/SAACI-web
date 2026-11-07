/** Chaves de cache do domínio `progress`. */
export const progressKeys = {
  all: ['progress'] as const,
  summary: () => [...progressKeys.all, 'summary'] as const,
}

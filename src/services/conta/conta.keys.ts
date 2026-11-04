export const contaKeys = {
  all: ['conta'] as const,
  sessao: () => [...contaKeys.all, 'sessao'] as const,
}

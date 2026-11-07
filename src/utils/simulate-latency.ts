/**
 * Espera um instante curto para o mock se comportar como uma rede de verdade.
 *
 * @remarks
 * Existe para os estados de carregamento aparecerem em desenvolvimento do mesmo jeito que vão
 * aparecer com o Supabase. Nos testes (`NODE_ENV` igual a `test`) resolve na hora, para o teste não
 * esperar à toa.
 *
 * @param ms Tempo de espera em milissegundos. Padrão: 300.
 * @returns Uma promessa que resolve depois do tempo, ou já resolvida nos testes.
 *
 * @example
 * ```ts
 * export async function getCursos(): Promise<Curso[]> {
 *   await simulateLatency()
 *   return listCursos()
 * }
 * ```
 */
export function simulateLatency(ms = 300): Promise<void> {
  if (process.env.NODE_ENV === 'test') return Promise.resolve()

  return new Promise((resolve) => setTimeout(resolve, ms))
}

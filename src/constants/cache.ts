// staleTime: 0 faz o dado hidratado nascer vencido e ser buscado de novo no primeiro mount.
export const STALE_TIME = {
  cadastro: 5 * 60_000,
  operacional: 30_000,
  calculo: 0,
} as const

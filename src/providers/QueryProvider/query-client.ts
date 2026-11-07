import { isServer, QueryClient } from '@tanstack/react-query'
import { cache } from 'react'

import { STALE_TIME } from '@/constants/cache'

function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { staleTime: STALE_TIME.operacional },
    },
  })
}

// Nunca variável de módulo no servidor: ela viveria entre requisições de alunos diferentes.
const getServerQueryClient = cache(makeQueryClient)

let browserQueryClient: QueryClient | undefined

/**
 * Devolve o `QueryClient` da requisição, no servidor, ou o único do navegador.
 *
 * @remarks
 * No servidor o cliente é novo a cada requisição (`React.cache`), então o dado de um aluno nunca
 * aparece para outro. No navegador é um só, criado na primeira chamada. Por isso não crie o cliente
 * com `new QueryClient()` na tela nem em `useState`: use sempre esta função, no prefetch da página e
 * no `QueryProvider`.
 *
 * @returns O cliente com `staleTime` padrão de `STALE_TIME.operacional`.
 */
export function getQueryClient(): QueryClient {
  if (isServer) return getServerQueryClient()

  browserQueryClient ??= makeQueryClient()
  return browserQueryClient
}

import { QueryClient, isServer } from '@tanstack/react-query'
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

export function getQueryClient(): QueryClient {
  if (isServer) return getServerQueryClient()

  browserQueryClient ??= makeQueryClient()
  return browserQueryClient
}

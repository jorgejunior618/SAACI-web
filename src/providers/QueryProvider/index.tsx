'use client'

import { QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'

import { getQueryClient } from './query-client'

type Props = {
  /** Árvore que pode usar os hooks do React Query. */
  children: ReactNode
}

/**
 * Disponibiliza o `QueryClient` do navegador para as telas.
 *
 * @remarks
 * Fica uma vez só, no layout raiz. O cliente vem de `getQueryClient`, o mesmo que o prefetch das
 * páginas usa no servidor.
 */
export function QueryProvider({ children }: Props): ReactNode {
  return <QueryClientProvider client={getQueryClient()}>{children}</QueryClientProvider>
}

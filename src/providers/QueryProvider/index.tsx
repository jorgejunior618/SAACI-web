'use client'

import { QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'

import { getQueryClient } from '../query-client'

type Props = {
  children: ReactNode
}

export function QueryProvider({ children }: Props): ReactNode {
  return <QueryClientProvider client={getQueryClient()}>{children}</QueryClientProvider>
}

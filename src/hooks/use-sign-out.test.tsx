// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { clearSessionCache, signOut } from '@/services/account'

import { useSignOut } from './use-sign-out'

const replace = vi.fn()

vi.mock('next/navigation', () => ({ useRouter: () => ({ replace }) }))
vi.mock('@supabase/client', () => ({ createClient: vi.fn() }))
vi.mock('@/services/account', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/services/account')>()

  return { ...actual, signOut: vi.fn(), clearSessionCache: vi.fn() }
})

function wrapper({ children }: { children: ReactNode }): ReactNode {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } })

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

describe('useSignOut', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('sai, esvazia o cache (RNF04) e leva a Entrar', async () => {
    vi.mocked(signOut).mockResolvedValueOnce(undefined)

    const { result } = renderHook(() => useSignOut(), { wrapper })

    result.current.mutate()

    await waitFor(() => expect(replace).toHaveBeenCalledWith('/entrar'))
    expect(signOut).toHaveBeenCalledTimes(1)
    expect(clearSessionCache).toHaveBeenCalledTimes(1)
  })

  it('quando sair falha, não navega nem esvazia o cache, e avisa pelo erro', async () => {
    vi.mocked(signOut).mockRejectedValueOnce(new Error('sem rede'))

    const { result } = renderHook(() => useSignOut(), { wrapper })

    result.current.mutate()

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(replace).not.toHaveBeenCalled()
    expect(clearSessionCache).not.toHaveBeenCalled()
  })
})

// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { Suspense } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { accountQueries } from '@/services/account'
import type { Session } from '@/services/account'
import { profileQueries } from '@/services/profile'
import type { Profile } from '@/services/profile'

import { SessionGate, SessionLoading } from './index'
import type { SessionGateMode } from './index'

const replace = vi.fn()

vi.mock('next/navigation', () => ({ useRouter: () => ({ replace }) }))
// Só o cache vazio chega ao cliente: a leitura da sessão nunca termina, para o teste ver o `Suspense`.
vi.mock('@supabase/client', () => ({
  createClient: () => ({ auth: { getUser: () => new Promise(() => {}) } }),
}))

const session: Session = { email: 'ana.moura07@aluno.ifce.edu.br', emailConfirmed: true }
const withCourse: Profile = {
  name: 'Ana',
  enrollmentId: null,
  startSemester: '2023-07-01',
  courseId: 'engenharia-de-computacao',
}
const withoutCourse: Profile = { ...withCourse, startSemester: null, courseId: null }

/** Cache como o servidor o entrega: sessão e perfil já hidratados, sem nenhuma busca no navegador. */
function renderGate(
  mode: SessionGateMode,
  cache: { session?: Session | null; profile?: Profile },
): void {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

  if (cache.session !== undefined) {
    queryClient.setQueryData(accountQueries.session().queryKey, cache.session)
  }
  if (cache.profile) queryClient.setQueryData(profileQueries.detail().queryKey, cache.profile)

  render(
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={<SessionLoading />}>
        <SessionGate mode={mode}>
          <p>Tela do grupo</p>
        </SessionGate>
      </Suspense>
    </QueryClientProvider>,
  )
}

describe('SessionGate', () => {
  beforeEach(() => {
    replace.mockReset()
  })

  it('mostra a tela, sem carregamento e sem redirecionar, quando o cache já tem sessão e curso', () => {
    renderGate('private', { session, profile: withCourse })

    expect(screen.getByText('Tela do grupo')).toBeInTheDocument()
    expect(screen.queryByText('Conferindo sua sessão')).not.toBeInTheDocument()
    expect(replace).not.toHaveBeenCalled()
  })

  it('leva a /entrar quem está sem sessão numa área logada, sem mostrar a tela', () => {
    renderGate('private', { session: null })

    expect(screen.queryByText('Tela do grupo')).not.toBeInTheDocument()
    expect(screen.getAllByText('Conferindo sua sessão').length).toBeGreaterThan(0)
    expect(replace).toHaveBeenCalledWith('/entrar')
  })

  it('deixa quem está sem sessão ver as telas públicas, sem buscar perfil', () => {
    renderGate('public', { session: null })

    expect(screen.getByText('Tela do grupo')).toBeInTheDocument()
    expect(replace).not.toHaveBeenCalled()
  })

  it('leva a /seu-curso quem tem sessão e ainda não escolheu o curso', () => {
    renderGate('private', { session, profile: withoutCourse })

    expect(screen.queryByText('Tela do grupo')).not.toBeInTheDocument()
    expect(replace).toHaveBeenCalledWith('/seu-curso')
  })

  it('leva a /inicio quem já tem curso e abriu uma tela pública', () => {
    renderGate('public', { session, profile: withCourse })

    expect(replace).toHaveBeenCalledWith('/inicio')
  })

  it('deixa quem tem sessão sem curso ver as telas da conta', () => {
    renderGate('account', { session, profile: withoutCourse })

    expect(screen.getByText('Tela do grupo')).toBeInTheDocument()
    expect(replace).not.toHaveBeenCalled()
  })

  it('mostra o carregamento enquanto a sessão não chegou ao cache', () => {
    renderGate('private', {})

    expect(screen.getAllByText('Conferindo sua sessão').length).toBeGreaterThan(0)
    expect(screen.queryByText('Tela do grupo')).not.toBeInTheDocument()
    expect(replace).not.toHaveBeenCalled()
  })
})

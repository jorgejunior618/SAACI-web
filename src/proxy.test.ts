// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import { NextRequest } from 'next/server'
import { readdirSync } from 'node:fs'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const auth = vi.hoisted(() => ({
  getClaims: vi.fn(),
  cookieMethods: undefined as
    | undefined
    | {
        setAll: (
          cookies: Array<{ name: string; value: string; options: Record<string, unknown> }>,
          headers: Record<string, string>,
        ) => void
      },
}))

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(
    (_url: string, _key: string, options: { cookies: typeof auth.cookieMethods }) => {
      auth.cookieMethods = options.cookies

      return { auth: { getClaims: auth.getClaims } }
    },
  ),
}))

import { config, proxy } from './proxy'

const COOKIE = 'sb-projeto-auth-token'

function request(path: string): NextRequest {
  return new NextRequest(`http://localhost:3000${path}`)
}

describe('proxy', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://exemplo.supabase.co')
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', 'sb_publishable_exemplo')
    auth.getClaims.mockReset()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('deixa a requisição seguir quando há sessão', async () => {
    auth.getClaims.mockResolvedValue({ data: { claims: { sub: 'aluno-1' } }, error: null })

    const response = await proxy(request('/inicio'))

    expect(response.headers.get('x-middleware-next')).toBe('1')
    expect(response.headers.get('location')).toBeNull()
  })

  it('manda para /entrar quem chega sem sessão', async () => {
    auth.getClaims.mockResolvedValue({ data: null, error: null })

    const response = await proxy(request('/inicio'))

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe('http://localhost:3000/entrar')
  })

  it('trata erro do Auth como sem sessão, sem lançar', async () => {
    auth.getClaims.mockResolvedValue({ data: null, error: new Error('cookie vencido') })

    const response = await proxy(request('/seu-curso'))

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe('http://localhost:3000/entrar')
  })

  it('grava na resposta o cookie e os cabeçalhos de cache que o Auth renovou', async () => {
    auth.getClaims.mockImplementation(async () => {
      auth.cookieMethods?.setAll([{ name: COOKIE, value: 'novo', options: { path: '/' } }], {
        'cache-control': 'private, no-store',
      })

      return { data: { claims: { sub: 'aluno-1' } }, error: null }
    })

    const response = await proxy(request('/inicio'))

    expect(response.cookies.get(COOKIE)?.value).toBe('novo')
    expect(response.headers.get('cache-control')).toBe('private, no-store')
  })

  it('leva ao redirecionamento o cookie que o Auth limpou', async () => {
    auth.getClaims.mockImplementation(async () => {
      auth.cookieMethods?.setAll([{ name: COOKIE, value: '', options: { maxAge: 0 } }], {
        'cache-control': 'private, no-store',
      })

      return { data: null, error: null }
    })

    const response = await proxy(request('/inicio'))

    expect(response.status).toBe(307)
    expect(response.cookies.get(COOKIE)).toBeDefined()
    expect(response.cookies.get(COOKIE)?.value).toBe('')
    expect(response.headers.get('cache-control')).toBe('private, no-store')
  })
})

/** Nomes das pastas de rota de um grupo (`[id]` e pastas auxiliares ficam de fora). */
function routesOf(group: string): string[] {
  return readdirSync(join(process.cwd(), 'src/app', group), { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !/^[[_]/.test(entry.name))
    .map((entry) => entry.name)
}

function isCovered(route: string): boolean {
  return config.matcher.some((path) => path === `/${route}` || path.startsWith(`/${route}/`))
}

describe('config.matcher', () => {
  it.each(['(aluno)', '(onboarding)', '(conta)'])('cobre toda rota do grupo %s', (group) => {
    const routes = routesOf(group)

    expect(routes.length).toBeGreaterThan(0) // pré-condição: há o que comparar
    expect(routes.filter((route) => !isCovered(route))).toEqual([])
  })

  it('deixa as rotas de (publico) de fora, para /nova-senha abrir com a sessão do link', () => {
    const routes = routesOf('(publico)')

    expect(routes.length).toBeGreaterThan(0)
    expect(routes.filter(isCovered)).toEqual([])
  })
})

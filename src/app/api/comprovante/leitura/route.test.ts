// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { UnreadableProofError } from '@/services/activities/activities.errors'

import { POST } from './route'

const mocks = vi.hoisted(() => ({
  createServerClient: vi.fn(),
  readProofWithAi: vi.fn(),
}))

vi.mock('@supabase/server', () => ({ createServerClient: mocks.createServerClient }))
vi.mock('@/services/activities/activities.proof-reading.server', () => ({
  readProofWithAi: mocks.readProofWithAi,
}))

const SUGGESTION = {
  itemNumber: 7,
  name: 'Curso de React',
  quantity: 40,
  startDate: '2026-08-03',
  endDate: '2026-09-12',
}

/** Requisição como a tela manda: mesma origem, com o arquivo no campo `proof`. */
function request(
  overrides: { headers?: Record<string, string>; withFile?: boolean } = {},
): Request {
  const body = new FormData()
  if (overrides.withFile !== false) {
    body.append('proof', new File(['%PDF-1.4'], 'certificado.pdf', { type: 'application/pdf' }))
  }

  // `Request` e `FormData` de ambientes diferentes não se entendem no jsdom (o `File` do jsdom não é o
  // do corpo `multipart`). O handler só lê os cabeçalhos e chama `formData()`, então basta isso.
  return {
    headers: new Headers({
      origin: 'http://localhost:3000',
      host: 'localhost:3000',
      'content-length': '1024',
      ...overrides.headers,
    }),
    formData: async () => body,
  } as unknown as Request
}

beforeEach(() => {
  vi.clearAllMocks()
  mocks.createServerClient.mockResolvedValue({})
  mocks.readProofWithAi.mockResolvedValue(SUGGESTION)
})

describe('POST /api/comprovante/leitura', () => {
  it('devolve a sugestão no 200', async () => {
    const response = await POST(request())

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual(SUGGESTION)
  })

  it.each([
    ['sem Origin', { origin: '' }],
    ['de outro site', { origin: 'https://outro-site.com' }],
    ['null (iframe isolado)', { origin: 'null' }],
  ])('recusa com 403 o POST %s, sem ler o arquivo', async (_name, headers) => {
    const response = await POST(request({ headers }))

    expect(response.status).toBe(403)
    expect(mocks.readProofWithAi).not.toHaveBeenCalled()
  })

  it('recusa com 411 quando não há Content-Length', async () => {
    const response = await POST(request({ headers: { 'content-length': '' } }))

    expect(response.status).toBe(411)
  })

  it('recusa com 413 o corpo maior que o arquivo permitido', async () => {
    const response = await POST(
      request({ headers: { 'content-length': String(20 * 1024 * 1024) } }),
    )

    expect(response.status).toBe(413)
    expect(mocks.readProofWithAi).not.toHaveBeenCalled()
  })

  it('recusa com 400 quando falta o arquivo', async () => {
    const response = await POST(request({ withFile: false }))

    expect(response.status).toBe(400)
  })

  it('responde 422 quando a leitura não deu', async () => {
    mocks.readProofWithAi.mockRejectedValue(new UnreadableProofError())

    const response = await POST(request())

    expect(response.status).toBe(422)
    expect(await response.json()).toEqual({ error: 'unreadable' })
  })

  it('responde 401 para quem não tem sessão', async () => {
    mocks.readProofWithAi.mockRejectedValue({ code: '42501', message: 'sem sessão' })

    const response = await POST(request())

    expect(response.status).toBe(401)
  })

  it('deixa subir o erro desconhecido, que vira 500 sem detalhe', async () => {
    mocks.readProofWithAi.mockRejectedValue(new Error('segredo interno'))

    await expect(POST(request())).rejects.toThrow('segredo interno')
  })
})

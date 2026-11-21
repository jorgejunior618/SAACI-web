import type { DbClient } from '@supabase/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { RuleItem } from '../rules/rules.types'
import { UnreadableProofError } from './activities.errors'
import { PROOF_READING_DAILY_LIMIT, readProofWithAi } from './activities.proof-reading.server'

const mocks = vi.hoisted(() => ({
  getProfile: vi.fn(),
  getRuleItems: vi.fn(),
}))

vi.mock('../profile/profile.api', () => ({ getProfile: mocks.getProfile }))
vi.mock('../rules/rules.api', () => ({ getRuleItems: mocks.getRuleItems }))

const ITEMS = [
  { itemNumber: 7, name: 'Cursos de extensão', rule: '1h a cada 4h', maxHours: 60 },
  { itemNumber: 9, name: 'Palestras', rule: '1h por palestra', maxHours: 20 },
] as unknown as RuleItem[]

const READ = {
  itemNumber: 7,
  name: 'Curso de React',
  quantity: 40,
  startDate: '2026-08-03',
  endDate: '2026-09-12',
}

const rpc = vi.fn()
const db = { rpc } as unknown as DbClient
const fetchMock = vi.fn()

/** Resposta do Google com o texto dado na primeira parte. */
function geminiReply(text: string, ok = true): Response {
  return new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text }] } }] }), {
    status: ok ? 200 : 429,
  })
}

function pdf(name = 'certificado.pdf'): File {
  return new File(['%PDF-1.4'], name, { type: 'application/pdf' })
}

beforeEach(() => {
  vi.stubEnv('GEMINI_API_KEY', 'chave-de-teste')
  vi.stubEnv('GEMINI_MODEL', '')
  vi.stubGlobal('fetch', fetchMock)
  mocks.getProfile.mockResolvedValue({ courseId: 'curso-1' })
  mocks.getRuleItems.mockResolvedValue(ITEMS)
  rpc.mockResolvedValue({ data: true, error: null })
  fetchMock.mockResolvedValue(geminiReply(JSON.stringify(READ)))
})

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
  vi.clearAllMocks()
})

describe('readProofWithAi', () => {
  it('devolve a sugestão e envia só o arquivo e os itens ao Google, com a chave no cabeçalho', async () => {
    await expect(readProofWithAi(pdf(), db)).resolves.toEqual(READ)

    expect(rpc).toHaveBeenCalledWith('reservar_leitura_comprovante', {
      limite: PROOF_READING_DAILY_LIMIT,
    })
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).not.toContain('chave-de-teste')
    expect((init.headers as Record<string, string>)['x-goog-api-key']).toBe('chave-de-teste')
    const body = JSON.parse(init.body as string)
    expect(body.contents[0].parts[0].text).toContain('7: Cursos de extensão')
    expect(body.contents[0].parts[1].inline_data.mime_type).toBe('application/pdf')
  })

  it('deixa null o campo que a IA não leu', async () => {
    const empty = { itemNumber: null, name: null, quantity: null, startDate: null, endDate: null }
    fetchMock.mockResolvedValue(geminiReply(JSON.stringify(empty)))

    await expect(readProofWithAi(pdf(), db)).resolves.toEqual(empty)
  })

  it('troca por null o item que não existe nas regras do curso', async () => {
    fetchMock.mockResolvedValue(geminiReply(JSON.stringify({ ...READ, itemNumber: 99 })))

    await expect(readProofWithAi(pdf(), db)).resolves.toEqual({ ...READ, itemNumber: null })
  })

  it('recusa sem chamar o Google quando a cota do dia acabou', async () => {
    rpc.mockResolvedValue({ data: false, error: null })

    await expect(readProofWithAi(pdf(), db)).rejects.toBeInstanceOf(UnreadableProofError)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('recusa o tipo de arquivo fora da lista, sem gastar cota', async () => {
    const gif = new File(['GIF89a'], 'a.gif', { type: 'image/gif' })

    await expect(readProofWithAi(gif, db)).rejects.toBeInstanceOf(UnreadableProofError)
    expect(rpc).not.toHaveBeenCalled()
  })

  it('repassa o erro do banco, como o de quem não tem sessão', async () => {
    const denied = { code: '42501', message: 'Entre na sua conta para ler o comprovante.' }
    rpc.mockResolvedValue({ data: null, error: denied })

    await expect(readProofWithAi(pdf(), db)).rejects.toBe(denied)
    expect(mocks.getProfile).not.toHaveBeenCalled()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('vira UnreadableProofError quando o Google recusa (cota esgotada)', async () => {
    fetchMock.mockResolvedValue(geminiReply('', false))

    await expect(readProofWithAi(pdf(), db)).rejects.toBeInstanceOf(UnreadableProofError)
  })

  it('vira UnreadableProofError na falha de rede ou no timeout', async () => {
    fetchMock.mockRejectedValue(new TypeError('fetch failed'))

    await expect(readProofWithAi(pdf(), db)).rejects.toBeInstanceOf(UnreadableProofError)
  })

  it('vira UnreadableProofError quando a resposta não é o JSON esperado', async () => {
    fetchMock.mockResolvedValue(geminiReply('não consegui ler'))
    await expect(readProofWithAi(pdf(), db)).rejects.toBeInstanceOf(UnreadableProofError)

    fetchMock.mockResolvedValue(geminiReply(JSON.stringify({ ...READ, startDate: 'ontem' })))
    await expect(readProofWithAi(pdf(), db)).rejects.toBeInstanceOf(UnreadableProofError)
  })

  it('falha alto quando a chave não está configurada', async () => {
    vi.stubEnv('GEMINI_API_KEY', '')

    await expect(readProofWithAi(pdf(), db)).rejects.toThrow('GEMINI_API_KEY')
  })
})

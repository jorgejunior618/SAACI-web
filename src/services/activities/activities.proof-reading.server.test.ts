// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import type { DbClient } from '@supabase/client'
import { PDFDocument } from 'pdf-lib'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import type { RuleItem } from '../rules/rules.types'
import { UnreadableProofError } from './activities.errors'
import {
  PROOF_READING_DAILY_LIMIT,
  PROOF_READING_PER_MINUTE_LIMIT,
  readProofWithAi,
} from './activities.proof-reading.server'

const mocks = vi.hoisted(() => ({
  getProfile: vi.fn(),
  getRuleItems: vi.fn(),
}))

vi.mock('../profile/profile.api', () => ({ getProfile: mocks.getProfile }))
vi.mock('../rules/rules.api', () => ({ getRuleItems: mocks.getRuleItems }))

const ITEMS = [
  {
    itemNumber: 7,
    name: 'Cursos de extensão',
    rule: '1h a cada 4h',
    ratio: { hours: 1, per: 4, unit: 'hora' },
    maxHours: 60,
  },
  {
    itemNumber: 9,
    name: 'Palestras',
    rule: '1h por palestra',
    ratio: { hours: 1, per: 1, unit: 'palestra' },
    maxHours: 20,
  },
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

/** PDF de verdade (o servidor abre o arquivo para contar as páginas), com o número de páginas pedido. */
async function makePdf(pages = 1): Promise<File> {
  const doc = await PDFDocument.create()
  for (let index = 0; index < pages; index += 1) doc.addPage()

  return new File([new Uint8Array(await doc.save())], 'certificado.pdf', {
    type: 'application/pdf',
  })
}

let PDF: File

beforeAll(async () => {
  PDF = await makePdf()
})

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
    await expect(readProofWithAi(PDF, db)).resolves.toEqual(READ)

    expect(rpc).toHaveBeenCalledWith('reservar_leitura_comprovante', {
      limite_dia: PROOF_READING_DAILY_LIMIT,
      limite_minuto: PROOF_READING_PER_MINUTE_LIMIT,
    })
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).not.toContain('chave-de-teste')
    expect((init.headers as Record<string, string>)['x-goog-api-key']).toBe('chave-de-teste')
    const body = JSON.parse(init.body as string)
    expect(body.contents[0].parts[0].text).toContain('7: Cursos de extensão (quantidade em hora)')
    expect(body.contents[0].parts[0].text).toContain('9: Palestras (quantidade em palestra)')
    expect(body.contents[0].parts[1].inline_data.mime_type).toBe('application/pdf')
    expect(body.generationConfig.maxOutputTokens).toBe(512)
  })

  it('deixa null o campo que a IA não leu', async () => {
    const empty = { itemNumber: null, name: null, quantity: null, startDate: null, endDate: null }
    fetchMock.mockResolvedValue(geminiReply(JSON.stringify(empty)))

    await expect(readProofWithAi(PDF, db)).resolves.toEqual(empty)
  })

  it('troca por null o item que não existe nas regras do curso', async () => {
    fetchMock.mockResolvedValue(geminiReply(JSON.stringify({ ...READ, itemNumber: 99 })))

    await expect(readProofWithAi(PDF, db)).resolves.toEqual({ ...READ, itemNumber: null })
  })

  it('recusa sem chamar o Google quando a cota do dia ou do minuto acabou', async () => {
    rpc.mockResolvedValue({ data: false, error: null })

    await expect(readProofWithAi(PDF, db)).rejects.toBeInstanceOf(UnreadableProofError)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('recusa o arquivo que não é o que o tipo declara, sem gastar cota nem chamar o Google', async () => {
    const fake = new File(['MZ executável renomeado'], 'a.pdf', { type: 'application/pdf' })
    const pngAsPdf = new File(
      [new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])],
      'a.pdf',
      {
        type: 'application/pdf',
      },
    )

    await expect(readProofWithAi(fake, db)).rejects.toBeInstanceOf(UnreadableProofError)
    await expect(readProofWithAi(pngAsPdf, db)).rejects.toBeInstanceOf(UnreadableProofError)
    expect(rpc).not.toHaveBeenCalled()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('aceita imagem com os bytes certos', async () => {
    const jpeg = new File([new Uint8Array([0xff, 0xd8, 0xff, 0xe0])], 'foto.jpg', {
      type: 'image/jpeg',
    })

    await expect(readProofWithAi(jpeg, db)).resolves.toEqual(READ)
  })

  it('recusa PDF com mais de 4 páginas sem chamar o Google, e aceita 4', async () => {
    await expect(readProofWithAi(await makePdf(5), db)).rejects.toBeInstanceOf(UnreadableProofError)
    expect(fetchMock).not.toHaveBeenCalled()

    await expect(readProofWithAi(await makePdf(4), db)).resolves.toEqual(READ)
  })

  it('recusa PDF corrompido, que começa certo mas não abre', async () => {
    const broken = new File(['%PDF-1.4 sem estrutura nenhuma'], 'a.pdf', {
      type: 'application/pdf',
    })

    await expect(readProofWithAi(broken, db)).rejects.toBeInstanceOf(UnreadableProofError)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('deixa o nome null quando a IA devolve um texto grande demais', async () => {
    fetchMock.mockResolvedValue(geminiReply(JSON.stringify({ ...READ, name: 'x'.repeat(201) })))

    await expect(readProofWithAi(PDF, db)).resolves.toEqual({ ...READ, name: null })
  })

  it('recusa o tipo de arquivo fora da lista, sem gastar cota', async () => {
    const gif = new File(['GIF89a'], 'a.gif', { type: 'image/gif' })

    await expect(readProofWithAi(gif, db)).rejects.toBeInstanceOf(UnreadableProofError)
    expect(rpc).not.toHaveBeenCalled()
  })

  it('repassa o erro do banco, como o de quem não tem sessão', async () => {
    const denied = { code: '42501', message: 'Entre na sua conta para ler o comprovante.' }
    rpc.mockResolvedValue({ data: null, error: denied })

    await expect(readProofWithAi(PDF, db)).rejects.toBe(denied)
    expect(mocks.getProfile).not.toHaveBeenCalled()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('vira UnreadableProofError quando o Google recusa (cota esgotada)', async () => {
    fetchMock.mockResolvedValue(geminiReply('', false))

    await expect(readProofWithAi(PDF, db)).rejects.toBeInstanceOf(UnreadableProofError)
  })

  it('vira UnreadableProofError na falha de rede ou no timeout', async () => {
    fetchMock.mockRejectedValue(new TypeError('fetch failed'))

    await expect(readProofWithAi(PDF, db)).rejects.toBeInstanceOf(UnreadableProofError)
  })

  it('vira UnreadableProofError quando a resposta não é o JSON esperado', async () => {
    fetchMock.mockResolvedValue(geminiReply('não consegui ler'))
    await expect(readProofWithAi(PDF, db)).rejects.toBeInstanceOf(UnreadableProofError)

    fetchMock.mockResolvedValue(geminiReply(JSON.stringify({ ...READ, startDate: 'ontem' })))
    await expect(readProofWithAi(PDF, db)).rejects.toBeInstanceOf(UnreadableProofError)
  })

  it('falha alto quando a chave não está configurada', async () => {
    vi.stubEnv('GEMINI_API_KEY', '')

    await expect(readProofWithAi(PDF, db)).rejects.toThrow('GEMINI_API_KEY')
  })
})

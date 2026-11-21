import { createServerClient } from '@supabase/server'

import { UnreadableProofError } from '@/services/activities/activities.errors'
import { readProofWithAi } from '@/services/activities/activities.proof-reading.server'
import { PROOF_MAX_BYTES } from '@/services/activities/activities.types'

/** Folga do corpo da requisição além do arquivo: o `multipart` leva cabeçalhos e o nome do campo. */
const BODY_OVERHEAD_BYTES = 64 * 1024

/** Diz se o erro é a recusa do banco por falta de sessão (SQLSTATE `42501`). */
function isUnauthenticated(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === '42501'
}

/**
 * Lê o comprovante enviado pelo aluno e responde com a sugestão para o formulário.
 *
 * @remarks
 * Existe para a chave do Gemini nunca chegar ao navegador (RF41). Espera `multipart/form-data` com o
 * campo `proof`. Respostas: 200 com a sugestão, 400 sem arquivo, 401 sem sessão, 413 arquivo grande
 * demais, 422 quando a leitura não deu (inclui a cota diária do aluno). Erro desconhecido sobe e vira
 * 500, sem texto do erro para o navegador.
 *
 * @param request Requisição com o arquivo no campo `proof`.
 * @returns A sugestão em JSON, ou `{ error }` com o status acima.
 */
export async function POST(request: Request): Promise<Response> {
  // Sem `Content-Length` não dá para recusar o corpo grande antes de lê-lo inteiro.
  const length = Number(request.headers.get('content-length'))
  if (!Number.isFinite(length) || length <= 0) {
    return Response.json({ error: 'length-required' }, { status: 411 })
  }
  if (length > PROOF_MAX_BYTES + BODY_OVERHEAD_BYTES) {
    return Response.json({ error: 'too-large' }, { status: 413 })
  }

  const form = await request.formData().catch(() => null)
  const proof = form?.get('proof')
  if (!(proof instanceof File)) return Response.json({ error: 'missing-proof' }, { status: 400 })

  try {
    const db = await createServerClient()
    return Response.json(await readProofWithAi(proof, db))
  } catch (error) {
    if (error instanceof UnreadableProofError) {
      return Response.json({ error: 'unreadable' }, { status: 422 })
    }
    if (isUnauthenticated(error))
      return Response.json({ error: 'unauthenticated' }, { status: 401 })
    throw error
  }
}

// Edge Function (Deno): apaga do bucket `comprovantes` os arquivos sem atividade. Quem chama é o
// `pg_cron`, de hora em hora (migration `limpa_comprovantes`), com o segredo no header. O SQL só lista
// (`comprovantes_orfaos`); apagar é pela API do Storage, que tira a linha e o arquivo do disco.
//
// Ambiente:
// - `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY`: o Supabase injeta, local e remoto.
// - `LIMPEZA_SEGREDO`: o mesmo valor do segredo `limpeza_segredo` do Vault (README).
import { createClient } from 'npm:@supabase/supabase-js@2.119.0'

const BUCKET = 'comprovantes'
const LOTE = 100
// Teto de lotes por chamada. Se o Storage recusar algum arquivo, ele volta na próxima listagem, e o
// teto impede o laço infinito. O que sobrar sai na próxima hora.
const MAXIMO_DE_LOTES = 20
// Folga padrão: o upload que ainda espera a RPC não pode ser apagado.
const IDADE_PADRAO = '1 hour'
// A idade pode vir no corpo, para o teste manual. Só número e unidade, nada que vire SQL estranho.
const IDADE_VALIDA = /^\d{1,4} (seconds|minutes|hours|days)$/

function resposta(status: number, corpo: Record<string, unknown>): Response {
  return Response.json(corpo, { status })
}

async function lerIdade(req: Request): Promise<string | null> {
  const texto = await req.text()

  if (!texto) return IDADE_PADRAO

  try {
    const corpo: unknown = JSON.parse(texto)
    const idade =
      typeof corpo === 'object' && corpo !== null && 'idade' in corpo ? corpo.idade : undefined

    if (idade === undefined) return IDADE_PADRAO
    return typeof idade === 'string' && IDADE_VALIDA.test(idade) ? idade : null
  } catch {
    return null
  }
}

Deno.serve(async (req) => {
  const segredo = Deno.env.get('LIMPEZA_SEGREDO')

  // Sem segredo configurado, a função não roda: melhor parar do que ficar aberta.
  if (!segredo || req.headers.get('x-limpeza-segredo') !== segredo) {
    return resposta(401, { erro: 'Chamada sem o segredo da limpeza.' })
  }

  const idade = await lerIdade(req)

  if (!idade) return resposta(400, { erro: 'Idade inválida. Use, por exemplo, "1 hour".' })

  const url = Deno.env.get('SUPABASE_URL')
  const chave = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

  if (!url || !chave) return resposta(500, { erro: 'Ambiente da função sem URL ou chave.' })

  const db = createClient(url, chave, { auth: { persistSession: false } })
  let apagados = 0

  for (let lote = 0; lote < MAXIMO_DE_LOTES; lote++) {
    const { data: caminhos, error } = await db.rpc('comprovantes_orfaos', {
      idade,
      limite: LOTE,
    })

    if (error) return resposta(500, { erro: error.message, apagados })
    if (!Array.isArray(caminhos) || caminhos.length === 0) break

    const removidos = await db.storage.from(BUCKET).remove(caminhos as string[])

    if (removidos.error) return resposta(500, { erro: removidos.error.message, apagados })
    apagados += removidos.data.length
    if (caminhos.length < LOTE) break
  }

  return resposta(200, { apagados })
})

// Edge Function (Deno): apaga do bucket `comprovantes` os arquivos sem atividade. Quem chama é o
// `pg_cron`, de hora em hora (migration `limpa_comprovantes`), com o segredo no header. O SQL só lista
// (`comprovantes_orfaos`); apagar é pela API do Storage, que tira a linha e o arquivo do disco.
//
// Ambiente:
// - `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY`: o Supabase injeta, local e remoto.
// - `LIMPEZA_SEGREDO`: o mesmo valor do segredo `limpeza_segredo` do Vault (README).
//
// Ficam em português só os contratos com o banco e o cron: o nome da função, o header
// `x-limpeza-segredo`, a variável `LIMPEZA_SEGREDO` e os parâmetros `idade` e `limite` da RPC.
import { createHash, timingSafeEqual } from 'node:crypto'

import { createClient } from 'npm:@supabase/supabase-js@2.119.0'

const BUCKET = 'comprovantes'
const SECRET_HEADER = 'x-limpeza-segredo'
const BATCH_SIZE = 100
// Teto de lotes por chamada. Se o Storage recusar algum arquivo, ele volta na próxima listagem, e o
// teto impede o laço infinito. O que sobrar sai na próxima hora.
const MAX_BATCHES = 20
// Folga padrão: o upload que ainda espera a RPC não pode ser apagado.
const DEFAULT_AGE = '1 hour'
// Piso da idade que vem no corpo (teste manual). A lista e a remoção não são atômicas: com idade
// perto de zero, a RPC de um registro em andamento pode gravar entre a lista e a remoção, e a
// atividade ficaria sem comprovante (RNF24). Um minuto é muito mais que o intervalo entre o upload e
// a RPC, que é de segundos.
const MIN_AGE_SECONDS = 60
// Só número e unidade, nada que vire SQL estranho. Singular e plural, como o Postgres aceita.
const AGE_PATTERN = /^(\d{1,4}) (second|minute|hour|day)s?$/
const SECONDS_PER_UNIT: Record<string, number> = {
  second: 1,
  minute: 60,
  hour: 3_600,
  day: 86_400,
}

function respond(status: number, body: Record<string, unknown>): Response {
  return Response.json(body, { status })
}

// Compara em tempo constante: `!==` para no primeiro caractere diferente, e o tempo de resposta
// revelaria quanto do começo acertou. O hash deixa os dois lados do mesmo tamanho.
function isSameSecret(received: string, expected: string): boolean {
  const digest = (value: string) => createHash('sha256').update(value).digest()

  return timingSafeEqual(digest(received), digest(expected))
}

// A idade em segundos, ou `null` se o texto não for "número unidade".
function toSeconds(age: string): number | null {
  const match = AGE_PATTERN.exec(age)

  if (!match) return null
  return Number(match[1]) * (SECONDS_PER_UNIT[match[2] ?? ''] ?? 0)
}

// A idade do corpo, a padrão se o corpo vier vazio, ou `null` se for inválida ou menor que o piso.
async function readAge(req: Request): Promise<string | null> {
  const text = await req.text()

  if (!text) return DEFAULT_AGE

  try {
    const body: unknown = JSON.parse(text)
    const age =
      typeof body === 'object' && body !== null && 'idade' in body ? body.idade : undefined

    if (age === undefined) return DEFAULT_AGE
    if (typeof age !== 'string') return null

    const seconds = toSeconds(age)

    return seconds !== null && seconds >= MIN_AGE_SECONDS ? age : null
  } catch {
    return null
  }
}

Deno.serve(async (req) => {
  const secret = Deno.env.get('LIMPEZA_SEGREDO')

  // Sem segredo configurado, a função não roda: melhor parar do que ficar aberta.
  if (!secret || !isSameSecret(req.headers.get(SECRET_HEADER) ?? '', secret)) {
    return respond(401, { error: 'Chamada sem o segredo da limpeza.' })
  }

  const age = await readAge(req)

  if (!age) {
    return respond(400, {
      error: 'Idade inválida. Use, por exemplo, "1 hour". O mínimo é "1 minute".',
    })
  }

  const url = Deno.env.get('SUPABASE_URL')
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

  if (!url || !key) return respond(500, { error: 'Ambiente da função sem URL ou chave.' })

  const db = createClient(url, key, { auth: { persistSession: false } })
  let deleted = 0

  for (let batch = 0; batch < MAX_BATCHES; batch++) {
    const { data: paths, error } = await db.rpc('comprovantes_orfaos', {
      idade: age,
      limite: BATCH_SIZE,
    })

    if (error) return respond(500, { error: error.message, deleted })
    if (!Array.isArray(paths) || paths.length === 0) break

    const removed = await db.storage.from(BUCKET).remove(paths as string[])

    if (removed.error) return respond(500, { error: removed.error.message, deleted })
    deleted += removed.data.length
    if (paths.length < BATCH_SIZE) break
  }

  return respond(200, { deleted })
})

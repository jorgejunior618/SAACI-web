import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import { getSupabaseEnv } from './@supabase/env'

/** Rota para onde vai quem chega a uma área logada sem sessão. */
const SIGN_IN_PATH = '/entrar'

/** Cabeçalhos de cache que o `@supabase/ssr` envia junto do cookie, para o CDN não guardar a resposta. */
const CACHE_HEADERS = ['cache-control', 'expires', 'pragma']

/**
 * Renova o cookie de sessão e manda para Entrar quem chega sem sessão a uma área logada.
 *
 * @remarks
 * Roda antes da renderização, só nas rotas de `config.matcher`. A conferência usa `getClaims()`,
 * nunca `getSession()`, que lê o cookie sem validá-lo. O proxy é um filtro rápido, não a autoridade:
 * uma conta apagada ainda tem JWT válido até vencer, e quem barra esse caso é o `SessionGate`, que
 * pergunta ao servidor do Auth. A autorização de verdade é a RLS.
 *
 * Quando o Auth renova ou limpa o cookie, o novo valor vai para a requisição (a renderização o lê) e
 * para a resposta (o navegador o guarda). O redirecionamento leva o mesmo cookie, senão o navegador
 * ficaria com o vencido. As rotas de `(publico)` ficam fora do `matcher`: `/nova-senha` usa a sessão
 * curta aberta pelo link e quebraria ao recarregar.
 *
 * @param request Requisição que o Next entrega ao proxy.
 * @returns A resposta que segue para a rota, ou o redirecionamento para `/entrar`.
 * @throws Error quando `NEXT_PUBLIC_SUPABASE_URL` ou a publishable key não estão preenchidas.
 */
export async function proxy(request: NextRequest): Promise<NextResponse> {
  const { url, publishableKey } = getSupabaseEnv()
  let response = NextResponse.next({ request })

  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet, headers) => {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        )
        Object.entries(headers).forEach(([name, value]) => response.headers.set(name, value))
      },
    },
  })

  // `error` sem `data` (cookie vencido, Auth fora do ar) conta como sem sessão: a pessoa entra de novo.
  const { data } = await supabase.auth.getClaims()

  if (data?.claims) return response

  const redirect = NextResponse.redirect(new URL(SIGN_IN_PATH, request.url))

  response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie))
  CACHE_HEADERS.forEach((name) => {
    const value = response.headers.get(name)

    if (value) redirect.headers.set(name, value)
  })

  return redirect
}

/**
 * Rotas em que o proxy roda: as de `(aluno)`, `(onboarding)` e `(conta)`.
 *
 * @remarks
 * O Next lê o `matcher` em build, então precisa ser constante. Rota nova nesses grupos entra aqui
 * (o teste de `proxy.test.ts` falha se faltar). Sem isso ela continua protegida pelo `SessionGate`,
 * mas a resposta sai renderizada antes do redirecionamento.
 */
export const config = {
  matcher: [
    '/inicio',
    '/atividades/:path*',
    '/eventos',
    '/perfil/:path*',
    '/privacidade',
    '/registrar',
    '/seu-curso',
    '/excluir-conta',
  ],
}

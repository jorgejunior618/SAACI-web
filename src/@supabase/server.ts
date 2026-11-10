import { createServerClient as createSsrServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

import type { DbClient } from './client'
import type { Database } from './database.types'
import { getSupabaseEnv } from './env'

/**
 * Cria o cliente do Supabase para o servidor, ligado aos cookies da requisição.
 *
 * @remarks
 * O Server Component (prefetch) deve passar este cliente ao service. Se omitir, o service cai no
 * cliente do navegador, que não enxerga o cookie de sessão: a busca volta vazia, sem erro.
 *
 * Server Component não grava cookie, então o `setAll` ignora esse erro. O refresh da sessão fica
 * para o `proxy.ts`, que entra com o login.
 *
 * @returns O cliente do servidor para a requisição atual.
 * @throws Error quando `NEXT_PUBLIC_SUPABASE_URL` ou a publishable key não estão preenchidas.
 *
 * @example
 * const db = await createServerClient()
 * await queryClient.prefetchQuery(activitiesQueries.list(filters, db))
 */
export async function createServerClient(): Promise<DbClient> {
  const { url, publishableKey } = getSupabaseEnv()
  const cookieStore = await cookies()

  return createSsrServerClient<Database>(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, options, value }) => cookieStore.set(name, value, options))
        } catch {
          // Chamado de um Server Component, onde gravar cookie não é permitido.
        }
      },
    },
  })
}

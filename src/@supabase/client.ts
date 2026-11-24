// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

import type { Database } from './database.types'
import { getSupabaseEnv } from './env'

/**
 * Cliente do Supabase tipado com o schema do banco.
 *
 * @remarks
 * É o tipo do parâmetro `db` dos services, que aceitam o cliente do navegador ou o do servidor.
 */
export type DbClient = SupabaseClient<Database>

/**
 * Cria o cliente do Supabase para o navegador.
 *
 * @remarks
 * Uso exclusivo de `services/`: tela e componente nunca importam este arquivo. No servidor, não
 * use esta função. O navegador não enxerga o cookie de sessão que o servidor lê, e a busca volta
 * vazia, sem erro. Passe sempre o cliente de `@supabase/server`.
 *
 * @returns O cliente do navegador, que o `@supabase/ssr` reaproveita entre chamadas.
 * @throws Error quando `NEXT_PUBLIC_SUPABASE_URL` ou a publishable key não estão preenchidas.
 *
 * @example
 * export async function getActivities(db: DbClient = createClient()) {
 *   return db.from('atividades').select('id')
 * }
 */
export function createClient(): DbClient {
  const { url, publishableKey } = getSupabaseEnv()

  return createBrowserClient<Database>(url, publishableKey)
}

// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

/** Credenciais públicas do projeto Supabase, lidas das variáveis de ambiente. */
export interface SupabaseEnv {
  /** Project URL do Supabase (`https://<id>.supabase.co`). */
  url: string
  /** Publishable key (`sb_publishable_...`). A segurança vem do RLS, não do segredo da chave. */
  publishableKey: string
}

/**
 * Lê a URL e a publishable key do Supabase e lança um erro que diz o que fazer quando faltam.
 *
 * @remarks
 * As variáveis são lidas pelo nome literal de propósito: o Next.js só embute `NEXT_PUBLIC_*` no
 * código do navegador quando o acesso é `process.env.NOME`, nunca por chave dinâmica. Só roda quando
 * um cliente é criado, então o app com mock abre mesmo com o `.env.development.local` vazio.
 *
 * @returns A URL e a publishable key, já conferidas.
 * @throws Error quando alguma das duas variáveis está vazia ou ausente.
 *
 * @example
 * const { url, publishableKey } = getSupabaseEnv()
 */
export function getSupabaseEnv(): SupabaseEnv {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  const missing = [
    url ? null : 'NEXT_PUBLIC_SUPABASE_URL',
    publishableKey ? null : 'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
  ].filter((name) => name !== null)

  if (!url || !publishableKey) {
    throw new Error(
      `Variável de ambiente ausente: ${missing.join(', ')}. ` +
        'Copie o .env.example para .env.development.local e preencha os valores (README, seção "Supabase"). ' +
        'Depois, reinicie o servidor de desenvolvimento.',
    )
  }

  return { url, publishableKey }
}

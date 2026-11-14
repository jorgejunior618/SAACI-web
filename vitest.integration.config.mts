import { execFileSync } from 'node:child_process'

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// A suíte cria e apaga contas de verdade. Por isso ela NUNCA lê o `.env.local`, que pode apontar
// para o projeto remoto: a URL e a chave vêm do banco local, perguntadas à CLI do Supabase.
function readLocalSupabase(): { url: string; publishableKey: string } {
  try {
    const output = execFileSync('pnpm', ['exec', 'supabase', 'status', '-o', 'json'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    })
    const status = JSON.parse(output.slice(output.indexOf('{'))) as {
      API_URL: string
      PUBLISHABLE_KEY: string
    }

    return { url: status.API_URL, publishableKey: status.PUBLISHABLE_KEY }
  } catch {
    throw new Error(
      'Não foi possível ler o Supabase local. Abra o Docker, rode `pnpm db:start` e tente de novo.',
    )
  }
}

const local = readLocalSupabase()

export default defineConfig({
  plugins: [react()],
  resolve: { tsconfigPaths: true },
  test: {
    // jsdom, e não node: o `createBrowserClient` só guarda a sessão em cookie e reaproveita o cliente
    // quando enxerga um navegador. Em node, cada chamada abriria um cliente sem sessão.
    environment: 'jsdom',
    environmentOptions: { jsdom: { url: 'http://localhost:3000' } },
    globals: true,
    include: ['tests/integration/**/*.test.ts'],
    setupFiles: ['./tests/integration/setup.ts'],
    // Os testes dividem o mesmo banco e o mesmo servidor de e-mail.
    fileParallelism: false,
    testTimeout: 20_000,
    env: {
      NEXT_PUBLIC_SUPABASE_URL: local.url,
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: local.publishableKey,
      TZ: 'UTC',
    },
  },
})

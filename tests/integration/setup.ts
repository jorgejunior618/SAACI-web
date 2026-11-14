// Trava de segurança: a suíte cria e apaga contas, então só roda contra o banco local.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''

if (!/^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?(\/|$)/.test(url)) {
  throw new Error(
    `A suíte de integração só roda no Supabase local, mas a URL é "${url}". ` +
      'Rode `pnpm db:start` e use `pnpm test:rls`.',
  )
}

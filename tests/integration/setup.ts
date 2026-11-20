import { Blob as NodeBlob, File as NodeFile } from 'node:buffer'

// O `fetch` do Node (undici) não reconhece o `File`, o `Blob` e o `FormData` do jsdom: o upload iria
// como texto e o Storage recusaria o tipo. No navegador há uma classe só, então a suíte usa as do
// Node nos dois papéis. Precisa vir antes de qualquer import do app, porque os schemas guardam a
// classe (`v.instance(File)`) quando o módulo carrega. O `FormData` do Node não sai de nenhum módulo
// `node:`; o `Response` do Node, que o jsdom não troca, entrega uma instância dele.
const nodeFormData = await new Response('', {
  headers: { 'content-type': 'application/x-www-form-urlencoded' },
}).formData()

globalThis.File = NodeFile as typeof globalThis.File
globalThis.Blob = NodeBlob as typeof globalThis.Blob
globalThis.FormData = nodeFormData.constructor as typeof globalThis.FormData

// Trava de segurança: a suíte cria e apaga contas, então só roda contra o banco local.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''

if (!/^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?(\/|$)/.test(url)) {
  throw new Error(
    `A suíte de integração só roda no Supabase local, mas a URL é "${url}". ` +
      'Rode `pnpm db:start` e use `pnpm test:rls`.',
  )
}

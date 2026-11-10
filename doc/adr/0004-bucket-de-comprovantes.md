# 0004. Comprovantes em bucket privado, com pasta por aluno e sem URL pública

- **Status:** Proposta
- **Data:** 10/11/2026

## Contexto

Cada aluno vê só os próprios comprovantes (RNF04). Ler o arquivo de outro não dá erro, só devolve
nada, então a regra precisa estar no banco e ter teste (`doc/testes.md`). O arquivo aceita PDF, JPG e
PNG (RNF25) e o limite de tamanho ainda é `[TAMANHO MÁXIMO DO COMPROVANTE]`: o design fixou 10 MB e
falta confirmar (RF31). Sem esta decisão, a integração de atividades teria de inventar o bucket, as
policies e o nome da pasta.

## Decisão

- **Um bucket `comprovantes`, privado, criado por migration.** O bloco `[storage.buckets]` do
  `supabase/config.toml` vale só no banco local, e a migration sobe para produção com
  `supabase db push`.
- **Limites no bucket:** `file_size_limit = 10485760` e `allowed_mime_types` com `application/pdf`,
  `image/jpeg` e `image/png`. São os mesmos valores de `PROOF_MAX_BYTES` e `PROOF_MIME_TYPES` em
  `src/services/activities/activities.types.ts`, e `tests/proof-storage.test.ts` trava a divergência.
- **Pasta por aluno.** O caminho é `<auth.uid()>/<arquivo>`. As policies de `storage.objects`
  (`select`, `insert` e `delete`, para `authenticated`) exigem
  `bucket_id = 'comprovantes'` e `(storage.foldername(name))[1] = (select auth.uid())::text`.
- **Sem policy de `update`.** O comprovante não se troca (ADR 0001): para usar outro arquivo, remove
  e registra de novo. Sem `update`, o `upsert` do Storage também é recusado.
- **Nunca URL pública.** A tela pede uma URL assinada de vida curta a cada abertura, e ela só sai
  para quem passa na policy de `select`. Nenhum arquivo de `src/` usa `getPublicUrl`.
- **O limite segue como `[TAMANHO MÁXIMO DO COMPROVANTE]`** até a equipe confirmar. Mudar é uma
  migration de uma linha e o ajuste de `PROOF_MAX_BYTES`.

## Consequências

- O isolamento é testado com pgTAP em `supabase/tests/database/comprovantes_isolados.test.sql`
  (`pnpm test:db`), e vimos o teste falhar com a condição de pasta removida da policy de `select`.
- O Storage barra `delete` direto em `storage.objects` (gatilho `protect_delete`) e libera quando
  `storage.allow_delete_query` é `'true'`, que é o que a API faz. O teste liga o ajuste para o RLS
  decidir.
- O pgTAP não exercita o limite de tamanho nem o tipo de arquivo, que quem recusa é a API do Storage.
  O teste confere só a configuração do bucket.
- O TTL da URL assinada e a troca do mock por `createSignedUrl` ficam para a integração de
  atividades, junto da gravação completa ou nada (RNF24).
- Apagar a conta não leva os arquivos por cascade: a rotina que os apaga continua em aberto
  (`modelagem-dados.md`).

## Alternativas descartadas

- **Bucket em `config.toml`.** Só vale no banco local e voltaria ao padrão num projeto criado do zero.
- **Bucket público com nome de arquivo aleatório.** Quem tiver o endereço lê o comprovante, que é
  dado pessoal. Proíbe RNF04.
- **Policy de `update`.** Abriria troca de arquivo que o produto não permite e criaria um caminho
  para sobrescrever o comprovante de uma atividade já registrada.
- **Teste de integração com supabase-js e dois logins.** Prova também o limite e a URL assinada, mas
  exige um arnês novo (`tests/integration`, `pnpm test:rls`, fixtures sem rollback), fora do tamanho
  desta issue. Entra quando a integração de atividades precisar.

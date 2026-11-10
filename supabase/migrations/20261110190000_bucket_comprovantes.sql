-- RNF04: cada aluno vê só os próprios comprovantes. O arquivo vai para um bucket privado, numa pasta
-- por aluno (`<auth.uid()>/<arquivo>`), e a tela abre por URL assinada de vida curta. Nunca existe
-- URL pública (doc/modelagem-dados.md, seção "Comprovantes").

-- RF31: o comprovante pode ter até 10 MB (10 * 1024 * 1024 bytes). O valor é o mesmo de
-- `PROOF_MAX_BYTES` em `src/services/activities/activities.types.ts`. Mudar o limite é uma migration
-- de uma linha, nos dois lugares.
-- RNF25: só PDF, JPG e PNG, a mesma lista de `PROOF_MIME_TYPES`.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'comprovantes',
  'comprovantes',
  false,
  10485760,
  array['application/pdf', 'image/jpeg', 'image/png']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- A pasta é o primeiro segmento do caminho e tem de ser o `auth.uid()` de quem chama. A função vai
-- dentro de `(select ...)` para ser calculada uma vez (doc/rls-e-permissoes.md). Sem sessão,
-- `auth.uid()` é nulo e a comparação nunca é verdadeira: o estado degradado é negar.
-- `storage.objects` já nasce com RLS habilitado pelo Supabase.

-- Ler: abre o arquivo e também é o que a URL assinada exige de quem a pede.
create policy "aluno lê os próprios comprovantes"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'comprovantes'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- Gravar: só na própria pasta, senão o aluno escreveria na pasta de outro.
create policy "aluno envia comprovante para a própria pasta"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'comprovantes'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- Apagar: remover a atividade apaga o comprovante. Pela API o delete também passa pelo `select`
-- acima, que existe.
create policy "aluno apaga os próprios comprovantes"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'comprovantes'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- Não há policy de `update` de propósito: o comprovante não se troca (ADR 0001). Para usar outro
-- arquivo, remove e registra de novo. Sem `update`, o `upsert` do Storage também é recusado.

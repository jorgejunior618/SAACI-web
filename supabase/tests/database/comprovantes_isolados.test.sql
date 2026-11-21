-- RNF04: um aluno não lê, não grava e não apaga o comprovante de outro. Ler o de outro não dá erro,
-- só devolve nada, então o teste é obrigatório (doc/testes.md). Rode com `pnpm test:db`, com o banco
-- no ar.
begin;

create extension if not exists pgtap with schema extensions;

select plan(14);

-- Bucket: privado, 10 MB e só PDF, JPG e PNG (a conferência dos limites do Storage em si é da API)
select is(
  (select public from storage.buckets where id = 'comprovantes'),
  false,
  'o bucket de comprovantes é privado'
);
select is(
  (select file_size_limit from storage.buckets where id = 'comprovantes'),
  10485760::bigint,
  'o bucket limita o comprovante a 10 MB'
);
select is(
  (select allowed_mime_types from storage.buckets where id = 'comprovantes'),
  array['application/pdf', 'image/jpeg', 'image/png'],
  'o bucket aceita só PDF, JPG e PNG'
);

-- Fixture: dois alunos e um arquivo de cada, criados com o dono do banco (ignora RLS)
insert into auth.users (id, email)
values
  ('00000000-0000-0000-0000-0000000000c1', 'ana@aluno.ifce.edu.br'),
  ('00000000-0000-0000-0000-0000000000c2', 'bia@aluno.ifce.edu.br');

insert into storage.objects (bucket_id, name, owner_id)
values
  ('comprovantes', '00000000-0000-0000-0000-0000000000c1/ana.pdf', '00000000-0000-0000-0000-0000000000c1'),
  ('comprovantes', '00000000-0000-0000-0000-0000000000c2/bia.pdf', '00000000-0000-0000-0000-0000000000c2');

-- Só os arquivos da fixture: o banco local pode ter comprovantes de outras suítes (a de integração
-- grava sem rollback), e contar o bucket inteiro faria este teste depender do que já existe.
select is(
  (select count(*)::int from storage.objects
    where bucket_id = 'comprovantes'
      and owner_id in (
        '00000000-0000-0000-0000-0000000000c1',
        '00000000-0000-0000-0000-0000000000c2'
      )),
  2,
  'pré-condição: há um arquivo de cada aluno'
);

-- Como a Ana
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000c1","role":"authenticated"}', true);

select is(
  (select count(*)::int from storage.objects where bucket_id = 'comprovantes' and name like '%/ana.pdf'),
  1,
  'a Ana lê o próprio comprovante'
);
select is(
  (select count(*)::int from storage.objects where bucket_id = 'comprovantes' and name like '%/bia.pdf'),
  0,
  'a Ana não lê o comprovante da Bia'
);
select is(
  (select count(*)::int from storage.objects where bucket_id = 'comprovantes'),
  1,
  'a Ana não lista nada além do que é dela'
);
select lives_ok(
  $$insert into storage.objects (bucket_id, name, owner_id)
    values ('comprovantes', '00000000-0000-0000-0000-0000000000c1/ana-2.pdf', '00000000-0000-0000-0000-0000000000c1')$$,
  'a Ana grava na própria pasta'
);
select throws_ok(
  $$insert into storage.objects (bucket_id, name, owner_id)
    values ('comprovantes', '00000000-0000-0000-0000-0000000000c2/ana-intrusa.pdf', '00000000-0000-0000-0000-0000000000c1')$$,
  '42501',
  NULL,
  'a Ana não grava na pasta da Bia'
);
-- Sem policy de update, o comando alcança zero linhas, em silêncio
with trocadas as (
  update storage.objects
  set name = '00000000-0000-0000-0000-0000000000c1/renomeado.pdf'
  where bucket_id = 'comprovantes' and name = '00000000-0000-0000-0000-0000000000c1/ana.pdf'
  returning 1
)
select is((select count(*)::int from trocadas), 0, 'a Ana não troca o próprio comprovante: não há policy de update');

-- O Storage barra `delete` direto em `storage.objects` (gatilho `protect_delete`) e libera quando o
-- ajuste abaixo está ligado, que é o que a API faz ao apagar. Ligado aqui, quem decide é o RLS.
select set_config('storage.allow_delete_query', 'true', true);

-- Apagar o da Bia não dá erro, só alcança zero linhas
with apagadas as (
  delete from storage.objects
  where bucket_id = 'comprovantes' and name like '%/bia.pdf'
  returning 1
)
select is((select count(*)::int from apagadas), 0, 'a Ana não apaga o comprovante da Bia');

with apagadas as (
  delete from storage.objects
  where bucket_id = 'comprovantes' and name like '%/ana-2.pdf'
  returning 1
)
select is((select count(*)::int from apagadas), 1, 'a Ana apaga o próprio comprovante');

-- Sem sessão (anon) não enxerga nada
reset role;
set local role anon;
select set_config('request.jwt.claims', '', true);

select is(
  (select count(*)::int from storage.objects where bucket_id = 'comprovantes'),
  0,
  'quem não está logado não lê nenhum comprovante'
);

-- Volta ao dono e confirma que o arquivo da Bia segue lá
reset role;
select is(
  (select count(*)::int from storage.objects where bucket_id = 'comprovantes' and name like '%/bia.pdf'),
  1,
  'o comprovante da Bia continua guardado'
);

select * from finish();

rollback;

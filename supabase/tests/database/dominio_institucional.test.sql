-- RF02: o domínio institucional é barrado no servidor, no cadastro (hook) e na troca de e-mail
-- (gatilho). Rode com `pnpm test:db`, com o banco no ar.
begin;

create extension if not exists pgtap with schema extensions;

select plan(13);

-- Regra de domínio
select ok(public.email_institucional('ana@aluno.ifce.edu.br'), 'aceita e-mail do aluno do IFCE');
select ok(public.email_institucional('Ana@ALUNO.IFCE.EDU.BR'), 'aceita maiúsculas');
select ok(not public.email_institucional('ana@gmail.com'), 'barra domínio de fora');
select ok(
  not public.email_institucional('ana@aluno.ifce.edu.br.evil.com'),
  'barra domínio que só começa igual'
);
select ok(not public.email_institucional('a@b@aluno.ifce.edu.br'), 'barra dois arrobas');
select ok(not public.email_institucional(null), 'barra e-mail nulo');

-- Auth Hook before_user_created
select is(
  public.barrar_email_externo('{"user":{"email":"ana@gmail.com"}}'::jsonb) -> 'error' ->> 'http_code',
  '403',
  'hook devolve 403 para e-mail de fora'
);
select is(
  public.barrar_email_externo('{"user":{"email":"ana@gmail.com"}}'::jsonb) -> 'error' ->> 'message',
  'Use seu e-mail @aluno.ifce.edu.br.',
  'hook explica em português o que fazer'
);
select is(
  public.barrar_email_externo('{"user":{"email":"ana@aluno.ifce.edu.br"}}'::jsonb),
  '{}'::jsonb,
  'hook deixa o aluno do IFCE passar'
);

-- Gatilho da troca de e-mail
insert into auth.users (id, email)
values ('00000000-0000-0000-0000-0000000000a1', 'ana@aluno.ifce.edu.br');

select throws_ok(
  $$update auth.users set email = 'ana@gmail.com' where id = '00000000-0000-0000-0000-0000000000a1'$$,
  'P0001',
  'Use seu e-mail @aluno.ifce.edu.br.',
  'barra a troca de e-mail para fora do IFCE'
);
select throws_ok(
  $$update auth.users set email_change = 'ana@gmail.com' where id = '00000000-0000-0000-0000-0000000000a1'$$,
  'P0001',
  'Use seu e-mail @aluno.ifce.edu.br.',
  'barra a troca pendente para fora do IFCE'
);
select lives_ok(
  $$update auth.users set email = 'ana.silva@aluno.ifce.edu.br' where id = '00000000-0000-0000-0000-0000000000a1'$$,
  'deixa trocar para outro e-mail do IFCE'
);
select lives_ok(
  $$update auth.users set email_change = '' where id = '00000000-0000-0000-0000-0000000000a1'$$,
  'deixa limpar a troca pendente'
);

select * from finish();

rollback;

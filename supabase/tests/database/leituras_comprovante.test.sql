-- Limite de leituras de comprovante por IA (RF41, ADR 0016): o aluno só enxerga as próprias leituras,
-- não apaga nem inventa leitura, e a reserva para quando a cota do dia acaba. Ler a de outro não dá
-- erro, só zero linhas, por isso o teste é obrigatório (doc/testes.md). Rode com `pnpm test:db`, com
-- o banco no ar.
begin;

create extension if not exists pgtap with schema extensions;

select plan(12);

-- Estrutura e privilégios
select ok(
  (select relrowsecurity from pg_class where oid = 'public.leituras_comprovante'::regclass),
  'leituras_comprovante tem RLS ligado'
);
select ok(
  not has_table_privilege('anon', 'public.leituras_comprovante', 'select'),
  'o visitante não lê leitura'
);
select ok(
  not has_table_privilege('authenticated', 'public.leituras_comprovante', 'delete'),
  'o aluno não devolve leitura gasta'
);
select ok(
  not has_column_privilege('authenticated', 'public.leituras_comprovante', 'created_at', 'insert'),
  'o aluno não escolhe a data da leitura'
);
select ok(
  not has_function_privilege('anon', 'public.reservar_leitura_comprovante(integer)', 'execute'),
  'o visitante não reserva leitura'
);

-- Fixture: dois alunos. O gatilho de `auth.users` cria os perfis.
insert into auth.users (id, email, email_confirmed_at)
values
  ('00000000-0000-0000-0000-0000000000e1', 'ana.ia@aluno.ifce.edu.br', now()),
  ('00000000-0000-0000-0000-0000000000e2', 'bia.ia@aluno.ifce.edu.br', now());

-- Como a Ana
set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-0000-0000-0000000000e1","role":"authenticated"}',
  true
);

select ok(public.reservar_leitura_comprovante(2), 'a primeira leitura passa');
select ok(public.reservar_leitura_comprovante(2), 'a segunda leitura passa');
select ok(not public.reservar_leitura_comprovante(2), 'a terceira passa do limite e é recusada');
select is(
  (select count(*)::int from public.leituras_comprovante),
  2,
  'a leitura recusada não gasta linha'
);

-- Como a Bia: a cota da Ana não é dela
select set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-0000-0000-0000000000e2","role":"authenticated"}',
  true
);

select is(
  (select count(*)::int from public.leituras_comprovante),
  0,
  'a Bia não enxerga as leituras da Ana'
);
select ok(public.reservar_leitura_comprovante(2), 'a cota da Ana não consome a da Bia');

-- Sem sessão
select set_config('request.jwt.claims', '', true);

select throws_ok(
  $$select public.reservar_leitura_comprovante(2)$$,
  '42501',
  null,
  'sem sessão não reserva leitura'
);

select * from finish();
rollback;

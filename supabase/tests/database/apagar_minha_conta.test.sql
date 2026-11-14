-- RF33: o aluno apaga a própria conta, e só a própria. Apagar a conta de outro aluno não dá erro
-- nenhum, só leva o dado dele, por isso o teste é obrigatório.
-- Rode com `pnpm test:db`, com o banco no ar.
begin;

create extension if not exists pgtap with schema extensions;

select plan(7);

insert into auth.users (id, email, email_confirmed_at)
values
  ('00000000-0000-0000-0000-0000000000c1', 'quem.apaga@aluno.ifce.edu.br', now()),
  ('00000000-0000-0000-0000-0000000000c2', 'quem.fica@aluno.ifce.edu.br', now());

select ok(
  not has_function_privilege('anon', 'public.apagar_minha_conta()', 'execute'),
  'o visitante não executa a função'
);
select ok(
  has_function_privilege('authenticated', 'public.apagar_minha_conta()', 'execute'),
  'o aluno logado executa a função'
);

-- Sem sessão: `auth.uid()` é nulo, e nenhuma conta sai.
select is(public.apagar_minha_conta(), 0, 'sem sessão não apaga conta nenhuma');
select is(
  (select count(*)::int from auth.users where id in (
    '00000000-0000-0000-0000-0000000000c1',
    '00000000-0000-0000-0000-0000000000c2'
  )),
  2,
  'as duas contas continuam depois da chamada sem sessão'
);

-- Com sessão do aluno c1: só ele sai.
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000c1', true);

select is(public.apagar_minha_conta(), 1, 'com sessão apaga exatamente uma conta');
select is(
  (select count(*)::int from auth.users where id = '00000000-0000-0000-0000-0000000000c1'),
  0,
  'apagou a conta de quem chamou'
);
select is(
  (select count(*)::int from auth.users where id = '00000000-0000-0000-0000-0000000000c2'),
  1,
  'manteve a conta de outro aluno'
);

select * from finish();

rollback;

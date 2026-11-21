-- RNF27: conta sem e-mail confirmado é apagada depois de 7 dias. Quem confirmou nunca é apagado,
-- e uma conta apagada por engano leva o aluno junto, por isso o teste é obrigatório.
-- Rode com `pnpm test:db`, com o banco no ar.
begin;

create extension if not exists pgtap with schema extensions;

select plan(8);

-- A limpeza age sobre todas as contas do banco, e o banco local pode ter conta antiga sem confirmar
-- (de uso manual ou de outra suíte). Marca como confirmada, dentro desta transação que dá rollback,
-- toda conta que não é da fixture, para a contagem abaixo ser só a da fixture.
update auth.users
   set email_confirmed_at = now()
 where email_confirmed_at is null;

insert into auth.users (id, email, email_confirmed_at, created_at)
values
  ('00000000-0000-0000-0000-0000000000b1', 'velha.sem.confirmar@aluno.ifce.edu.br', null, now() - interval '8 days'),
  ('00000000-0000-0000-0000-0000000000b2', 'velha.confirmada@aluno.ifce.edu.br', now() - interval '8 days', now() - interval '8 days'),
  ('00000000-0000-0000-0000-0000000000b3', 'recente.sem.confirmar@aluno.ifce.edu.br', null, now() - interval '1 day'),
  ('00000000-0000-0000-0000-0000000000b4', 'limite.sem.confirmar@aluno.ifce.edu.br', null, now() - interval '6 days 23 hours');

select is(public.apagar_contas_nao_confirmadas(), 1, 'apaga só uma conta com o prazo padrão de 7 dias');

select is(
  (select count(*)::int from auth.users where id = '00000000-0000-0000-0000-0000000000b1'),
  0,
  'apagou a conta com 8 dias e sem confirmar'
);
select is(
  (select count(*)::int from auth.users where id = '00000000-0000-0000-0000-0000000000b2'),
  1,
  'mantém a conta antiga que confirmou o e-mail'
);
select is(
  (select count(*)::int from auth.users where id in (
    '00000000-0000-0000-0000-0000000000b3',
    '00000000-0000-0000-0000-0000000000b4'
  )),
  2,
  'mantém a conta sem confirmar que ainda está dentro dos 7 dias'
);

select is(
  public.apagar_contas_nao_confirmadas('12 hours'),
  2,
  'o prazo passado por parâmetro vale no lugar do padrão'
);

select ok(
  not has_function_privilege('anon', 'public.apagar_contas_nao_confirmadas(interval)', 'execute'),
  'o visitante não executa a limpeza'
);
select ok(
  not has_function_privilege('authenticated', 'public.apagar_contas_nao_confirmadas(interval)', 'execute'),
  'o aluno logado não executa a limpeza'
);

select is(
  (select schedule from cron.job where jobname = 'apagar-contas-nao-confirmadas'),
  '0 3 * * *',
  'a limpeza está agendada todo dia às 03:00 UTC'
);

select * from finish();

rollback;

-- Progresso do aluno (RF14, RF38, RNF20): cada aluno recebe o total das próprias atividades, o aluno
-- sem curso recebe nulo e o visitante não executa a função. Somar atividade de outro não dá erro, só
-- um total errado, por isso o teste é obrigatório (doc/testes.md). Rode com `pnpm test:db`.
begin;

create extension if not exists pgtap with schema extensions;

select plan(10);

-- Estrutura e privilégios
select has_function('public', 'calcula_horas', array['jsonb'], 'a conta única existe');
select has_function('public', 'progresso_do_aluno', array[]::text[], 'o progresso do aluno existe');
select ok(
  not has_function_privilege('anon', 'public.progresso_do_aluno()', 'execute'),
  'o visitante não executa o progresso'
);
select ok(
  not has_function_privilege('anon', 'public.calcula_horas(jsonb)', 'execute'),
  'o visitante não executa a conta'
);

-- Fixture: Ana e Bia no curso-piloto e Carla sem curso. O gatilho de `auth.users` cria os perfis.
insert into auth.users (id, email, email_confirmed_at)
values
  ('00000000-0000-0000-0000-0000000000e1', 'ana@aluno.ifce.edu.br', now()),
  ('00000000-0000-0000-0000-0000000000e2', 'bia@aluno.ifce.edu.br', now()),
  ('00000000-0000-0000-0000-0000000000e3', 'carla@aluno.ifce.edu.br', now());

update public.perfis
   set curso_id = '3b1f6d2e-5a47-4c80-9e1b-7d0c2a4f8e11', semestre_inicio = '2023-07-01'
 where aluno_id in (
   '00000000-0000-0000-0000-0000000000e1',
   '00000000-0000-0000-0000-0000000000e2'
 );

insert into storage.objects (bucket_id, name, owner_id, metadata)
values
  ('comprovantes', '00000000-0000-0000-0000-0000000000e1/a1.pdf', '00000000-0000-0000-0000-0000000000e1',
   '{"size": 700000, "mimetype": "application/pdf"}'),
  ('comprovantes', '00000000-0000-0000-0000-0000000000e1/a2.pdf', '00000000-0000-0000-0000-0000000000e1',
   '{"size": 700000, "mimetype": "application/pdf"}'),
  ('comprovantes', '00000000-0000-0000-0000-0000000000e1/a3.pdf', '00000000-0000-0000-0000-0000000000e1',
   '{"size": 700000, "mimetype": "application/pdf"}'),
  ('comprovantes', '00000000-0000-0000-0000-0000000000e2/b1.pdf', '00000000-0000-0000-0000-0000000000e2',
   '{"size": 500000, "mimetype": "application/pdf"}');

-- Como a Ana: item 7 (1h a cada 4h) com 32h vale 8h; item 13 (2h por palestra) com 1 palestra vale 2h;
-- a terceira começa antes do ingresso e não conta (RF38).
set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-0000-0000-0000000000e1","role":"authenticated"}',
  true
);

select public.registrar_atividade(
  'Curso de Git e GitHub', 7, 32, '2025-04-07', '2025-05-03',
  '00000000-0000-0000-0000-0000000000e1/a1.pdf', 'git.pdf', repeat('a', 64)
);
select public.registrar_atividade(
  'Palestra sobre computação quântica', 13, 1, '2025-03-12', '2025-03-12',
  '00000000-0000-0000-0000-0000000000e1/a2.pdf', 'quantica.pdf', repeat('b', 64)
);
select public.registrar_atividade(
  'Palestra de boas-vindas', 13, 1, '2023-02-10', '2023-02-10',
  '00000000-0000-0000-0000-0000000000e1/a3.pdf', 'boas-vindas.pdf', repeat('c', 64)
);

select is(
  (select (public.progresso_do_aluno() ->> 'total_horas')::numeric),
  10::numeric,
  'a Ana tem 10h: 8h do item 7 e 2h do item 13, sem a atividade anterior ao ingresso'
);
select is(
  (select jsonb_array_length(public.progresso_do_aluno() -> 'itens')),
  2,
  'só os itens com horas aparecem'
);

-- Como a Bia: item 6 (1h a cada 4h) com 7h vale 1,7h, e o total é 1h (RF14).
select set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-0000-0000-0000000000e2","role":"authenticated"}',
  true
);

select public.registrar_atividade(
  'Curso de inglês', 6, 7, '2025-02-03', '2025-06-30',
  '00000000-0000-0000-0000-0000000000e2/b1.pdf', 'ingles.pdf', repeat('d', 64)
);

select is(
  (select public.progresso_do_aluno() ->> 'total_horas')::numeric,
  1::numeric,
  'a Bia tem o próprio total, truncado em horas inteiras, sem as horas da Ana'
);
select is(
  (select public.progresso_do_aluno() ->> 'soma_itens')::numeric,
  1.7::numeric,
  'a soma dos itens guarda a casa decimal que o total trunca'
);

-- Como a Carla: sem curso no perfil, não há o que calcular.
select set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-0000-0000-0000000000e3","role":"authenticated"}',
  true
);

select is(
  public.progresso_do_aluno(),
  null::jsonb,
  'o aluno sem curso recebe nulo'
);

reset role;

-- Item que não existe nas regras recusa o cálculo, como a função TypeScript.
select throws_ok(
  $$select public.calcula_horas(
      '{"semestre_inicio":"2023-07-01","meta_horas":120,"itens":[],
        "atividades":[{"id":"x","item_numero":99,"quantidade":1,
                       "data_inicio":"2025-01-01","registrado_em":"2025-01-01T00:00:00Z"}]}'::jsonb
    )$$,
  'P0001',
  'Atividade no item 99, que não existe nas regras do curso.',
  'atividade de item desconhecido não é calculada'
);

select * from finish();

rollback;

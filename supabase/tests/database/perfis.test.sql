-- Perfil do aluno: um aluno não lê nem muda o perfil de outro, o semestre é 1º de janeiro ou de
-- julho, e a troca de curso com atividades é recusada no banco (RF10).
-- Mudar a regra de outro aluno não dá erro, só zero linhas, por isso o teste é obrigatório.
-- Rode com `pnpm test:db`, com o banco no ar.
begin;

create extension if not exists pgtap with schema extensions;

select plan(20);

insert into auth.users (id, email, email_confirmed_at)
values
  ('00000000-0000-0000-0000-0000000000e1', 'aluno.a@aluno.ifce.edu.br', now()),
  ('00000000-0000-0000-0000-0000000000e2', 'aluno.b@aluno.ifce.edu.br', now());

insert into public.cursos (id, nome, grau, campus, carga_total_horas)
values ('00000000-0000-0000-0000-0000000000f2', 'Curso de Teste', 'Bacharelado', 'Fortaleza', 100);

select ok(
  (select relrowsecurity from pg_class where oid = 'public.perfis'::regclass),
  'perfis tem RLS ligado'
);
select ok(
  not has_table_privilege('anon', 'public.perfis', 'select'),
  'o visitante não lê perfil'
);
select ok(
  not has_column_privilege('authenticated', 'public.perfis', 'aluno_id', 'update'),
  'o aluno não troca o dono da linha'
);
select hasnt_column('public', 'perfis', 'email', 'o e-mail fica em auth.users, não no perfil');

-- O cadastro cria a linha, vazia: o aluno escolhe curso e semestre em Seu curso (RF09, RF11).
select is(
  (select count(*)::int from public.perfis
    where aluno_id in (
      '00000000-0000-0000-0000-0000000000e1',
      '00000000-0000-0000-0000-0000000000e2'
    )),
  2,
  'o gatilho cria um perfil para cada conta nova'
);
select is(
  (select count(*)::int from public.perfis
    where aluno_id = '00000000-0000-0000-0000-0000000000e1'
      and nome is null and matricula is null and semestre_inicio is null and curso_id is null),
  1,
  'o perfil nasce sem nome, matrícula, semestre nem curso'
);

-- Aluno A.
set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000e1', true);

select is(
  (select count(*)::int from public.perfis),
  1,
  'o aluno enxerga só o próprio perfil'
);
select lives_ok(
  $$update public.perfis set matricula = '2023104501'$$,
  'o aluno muda o próprio perfil'
);
select is(
  (select matricula from public.perfis),
  '2023104501',
  'a mudança do próprio perfil ficou gravada'
);
select is(
  (with alterada as (
     update public.perfis set matricula = 'invadida'
      where aluno_id = '00000000-0000-0000-0000-0000000000e2'
     returning 1
   ) select count(*)::int from alterada),
  0,
  'o aluno não muda o perfil de outro aluno'
);

select throws_ok(
  $$update public.perfis set semestre_inicio = '2023-03-01'$$,
  '23514',
  null,
  'recusa semestre que não começa em janeiro nem em julho'
);
select throws_ok(
  $$update public.perfis set semestre_inicio = '2023-07-15'$$,
  '23514',
  null,
  'recusa semestre que não começa no dia 1'
);
select lives_ok(
  $$update public.perfis set semestre_inicio = '2024-07-01'$$,
  'aceita 1º de julho'
);
select lives_ok(
  $$update public.perfis set curso_id = '3b1f6d2e-5a47-4c80-9e1b-7d0c2a4f8e11'$$,
  'aceita a primeira escolha de curso'
);
select lives_ok(
  $$update public.perfis set curso_id = '00000000-0000-0000-0000-0000000000f2'$$,
  'troca o curso enquanto não há atividades'
);
select throws_ok(
  $$update public.perfis set aluno_id = '00000000-0000-0000-0000-0000000000e2'$$,
  '42501',
  null,
  'o aluno não troca o dono do perfil'
);
select throws_ok(
  $$delete from public.perfis$$,
  '42501',
  null,
  'o aluno não apaga perfil'
);

-- RF10: com atividades, a troca de curso é recusada. A tabela de atividades ainda não existe (#20),
-- então o teste troca o stub por `true` dentro da transação, que o rollback desfaz.
reset role;
create or replace function public.aluno_tem_atividades(aluno uuid)
returns boolean
language sql
stable
set search_path = ''
as $$ select true; $$;

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000e1', true);

select throws_ok(
  $$update public.perfis set curso_id = '3b1f6d2e-5a47-4c80-9e1b-7d0c2a4f8e11'$$,
  'SA010',
  'Com atividades registradas, o curso fica travado.',
  'recusa a troca de curso com atividades registradas'
);
select lives_ok(
  $$update public.perfis
       set matricula = '2023104502', curso_id = '00000000-0000-0000-0000-0000000000f2'$$,
  'com atividades, ainda muda a matrícula e regrava o mesmo curso'
);

-- RF33: apagar a conta leva o perfil junto.
reset role;
delete from auth.users where id = '00000000-0000-0000-0000-0000000000e1';
select is(
  (select count(*)::int from public.perfis where aluno_id = '00000000-0000-0000-0000-0000000000e1'),
  0,
  'apagar a conta apaga o perfil'
);

select * from finish();

rollback;

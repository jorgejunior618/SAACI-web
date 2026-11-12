-- RNF21: as regras do curso são cadastro. Qualquer aluno logado lê; ninguém escreve pela API.
-- Rode com `pnpm test:db`, com o banco no ar.
begin;

create extension if not exists pgtap with schema extensions;

select plan(13);

select ok(
  (select relrowsecurity from pg_class where oid = 'public.cursos'::regclass),
  'cursos tem RLS ligado'
);
select ok(
  (select relrowsecurity from pg_class where oid = 'public.itens_curso'::regclass),
  'itens_curso tem RLS ligado'
);

-- Visitante: sem o privilégio de leitura.
select ok(
  not has_table_privilege('anon', 'public.cursos', 'select'),
  'o visitante não lê os cursos'
);
select ok(
  not has_table_privilege('anon', 'public.itens_curso', 'select'),
  'o visitante não lê os itens'
);

-- Aluno logado.
set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000d1', true);

select is((select count(*)::int from public.cursos), 1, 'o aluno lê o curso cadastrado');
select is(
  (select count(*)::int from public.itens_curso),
  24,
  'o aluno lê os 24 itens de Engenharia de Computação'
);
select is(
  (select nome_busca from public.cursos),
  'engenharia de computacao',
  'a busca ignora acento e caixa'
);
select is(
  (select sum(maximo_horas) from public.itens_curso where tipo_regra = 'fator'),
  (30 + 40 + 40 + 40 + 80 * 4)::numeric,
  'os máximos dos itens de fator batem com o formulário'
);
select is(
  (select tipo_regra from public.itens_curso where numero = 16),
  'pagina',
  'o item 16 conta por página'
);

-- Escrita: nenhuma, nem com sessão.
select throws_ok(
  $$insert into public.cursos (nome, grau, campus, carga_total_horas)
    values ('Curso Falso', 'Bacharelado', 'Fortaleza', 100)$$,
  '42501',
  null,
  'o aluno não cria curso'
);
select throws_ok(
  $$update public.itens_curso set maximo_horas = 999$$,
  '42501',
  null,
  'o aluno não altera item'
);
select throws_ok(
  $$delete from public.itens_curso$$,
  '42501',
  null,
  'o aluno não apaga item'
);

reset role;
select is(
  (select count(*)::int from public.itens_curso),
  24,
  'os 24 itens continuam depois das tentativas de escrita'
);

select * from finish();

rollback;

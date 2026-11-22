-- RNF21: as regras do curso são cadastro. Qualquer aluno logado lê; ninguém escreve pela API.
-- Rode com `pnpm test:db`, com o banco no ar.
begin;

create extension if not exists pgtap with schema extensions;

select plan(18);

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

-- O cálculo único usa só a razão (`horas`, `a_cada`, `unidade`) e o máximo; o texto é o que a tela
-- mostra. Os dois precisam dizer a mesma coisa.
select results_eq(
  $$select horas, a_cada, unidade from public.itens_curso
    where numero in (6, 9, 13, 16, 24) order by numero$$,
  $$values (1::numeric, 4::numeric, 'hora'::text), (2, 1, 'hora'), (2, 1, 'palestra'),
           (3, 10, 'pagina'), (8, 1, 'publicacao')$$,
  'a razão dos itens bate com o texto da regra'
);
select is(
  (select count(*)::int from public.itens_curso
    where regra not like ('%até ' || maximo_horas::int || 'h%')),
  0,
  'todo item traz o máximo no texto da regra'
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

-- `sem_acento` não é RPC pública. Quem escreve `cursos` é a migration, com o dono da função, e a
-- coluna gerada continua sendo preenchida.
select ok(
  not has_function_privilege('anon', 'public.sem_acento(text)', 'execute'),
  'o visitante não executa sem_acento'
);
select ok(
  not has_function_privilege('authenticated', 'public.sem_acento(text)', 'execute'),
  'o aluno logado não executa sem_acento'
);
insert into public.cursos (nome, grau, campus, carga_total_horas)
values ('Ciência da Computação', 'Bacharelado', 'Fortaleza', 100);
select is(
  (select nome_busca from public.cursos where nome = 'Ciência da Computação'),
  'ciencia da computacao',
  'o dono insere curso e nome_busca sai sem acento'
);

select * from finish();

rollback;

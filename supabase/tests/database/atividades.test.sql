-- Atividades do aluno: um aluno não lê, não corrige e não remove a atividade de outro, e não existe
-- atividade sem comprovante no bucket (RNF24). Ler a de outro não dá erro, só zero linhas, por isso o
-- teste é obrigatório (doc/testes.md). Rode com `pnpm test:db`, com o banco no ar.
begin;

create extension if not exists pgtap with schema extensions;

select plan(24);

-- Estrutura e privilégios
select ok(
  (select relrowsecurity from pg_class where oid = 'public.atividades'::regclass),
  'atividades tem RLS ligado'
);
select ok(
  not has_table_privilege('anon', 'public.atividades', 'select'),
  'o visitante não lê atividade'
);
select ok(
  not has_column_privilege('authenticated', 'public.atividades', 'aluno_id', 'insert'),
  'o aluno não escolhe o dono da atividade'
);
select ok(
  not has_column_privilege('authenticated', 'public.atividades', 'comprovante_tamanho', 'insert'),
  'o tamanho do comprovante não vem do navegador'
);
select ok(
  not has_column_privilege('authenticated', 'public.atividades', 'comprovante_caminho', 'update'),
  'o comprovante não se troca (ADR 0001)'
);
select has_trigger('public', 'atividades', 'atualiza_updated_at', 'toda correção renova o updated_at');
select hasnt_index(
  'public', 'atividades', 'atividades_comprovante_hash_key',
  'o hash não é unique: comprovante repetido só é avisado (RF42)'
);

-- Fixture: dois alunos no curso-piloto, com um arquivo de cada no bucket. O gatilho de `auth.users`
-- cria os perfis.
insert into auth.users (id, email, email_confirmed_at)
values
  ('00000000-0000-0000-0000-0000000000d1', 'ana@aluno.ifce.edu.br', now()),
  ('00000000-0000-0000-0000-0000000000d2', 'bia@aluno.ifce.edu.br', now());

update public.perfis
   set curso_id = '3b1f6d2e-5a47-4c80-9e1b-7d0c2a4f8e11', semestre_inicio = '2023-07-01';

insert into storage.objects (bucket_id, name, owner_id, metadata)
values
  ('comprovantes', '00000000-0000-0000-0000-0000000000d1/a1.pdf', '00000000-0000-0000-0000-0000000000d1',
   '{"size": 700000, "mimetype": "application/pdf"}'),
  ('comprovantes', '00000000-0000-0000-0000-0000000000d1/a2.png', '00000000-0000-0000-0000-0000000000d1',
   '{"size": 120000, "mimetype": "image/png"}'),
  ('comprovantes', '00000000-0000-0000-0000-0000000000d2/b1.pdf', '00000000-0000-0000-0000-0000000000d2',
   '{"size": 500000, "mimetype": "application/pdf"}');

-- Como a Ana
set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-0000-0000-0000000000d1","role":"authenticated"}',
  true
);

select lives_ok(
  $$select public.registrar_atividade(
      'Curso de Git e GitHub', 7, 32, '2025-04-07', '2025-05-03',
      '00000000-0000-0000-0000-0000000000d1/a1.pdf', 'certificado-git.pdf', repeat('a', 64)
    )$$,
  'a Ana registra uma atividade com o arquivo já enviado'
);
select results_eq(
  $$select aluno_id, curso_id, comprovante_tamanho, comprovante_tipo
      from public.atividades
     where comprovante_caminho = '00000000-0000-0000-0000-0000000000d1/a1.pdf'$$,
  $$values (
      '00000000-0000-0000-0000-0000000000d1'::uuid,
      '3b1f6d2e-5a47-4c80-9e1b-7d0c2a4f8e11'::uuid,
      700000::bigint,
      'application/pdf'::text
    )$$,
  'dono, curso, tamanho e tipo vêm da sessão, do perfil e do Storage'
);

-- RNF24: sem arquivo no bucket, não há atividade.
select throws_ok(
  $$select public.registrar_atividade(
      'Sem arquivo', 7, 10, '2025-01-01', '2025-01-02',
      '00000000-0000-0000-0000-0000000000d1/nao-existe.pdf', 'x.pdf', repeat('b', 64)
    )$$,
  'SA024',
  'O comprovante não foi enviado. Envie o arquivo de novo.',
  'recusa a atividade cujo arquivo não está no bucket'
);
select throws_ok(
  $$select public.registrar_atividade(
      'Arquivo da Bia', 7, 10, '2025-01-01', '2025-01-02',
      '00000000-0000-0000-0000-0000000000d2/b1.pdf', 'b1.pdf', repeat('c', 64)
    )$$,
  '42501',
  'O comprovante precisa estar na pasta do aluno.',
  'recusa o arquivo da pasta de outro aluno'
);
select throws_ok(
  $$select public.registrar_atividade(
      'Outro uso do mesmo arquivo', 7, 10, '2025-01-01', '2025-01-02',
      '00000000-0000-0000-0000-0000000000d1/a1.pdf', 'a1.pdf', repeat('a', 64)
    )$$,
  '23505',
  null,
  'um arquivo serve a uma atividade só'
);
select throws_ok(
  $$select public.registrar_atividade(
      'Item que não existe', 999, 10, '2025-01-01', '2025-01-02',
      '00000000-0000-0000-0000-0000000000d1/a2.png', 'a2.png', repeat('d', 64)
    )$$,
  '23503',
  null,
  'recusa item fora da matriz do curso'
);
select throws_ok(
  $$select public.registrar_atividade(
      'Datas trocadas', 7, 10, '2025-02-01', '2025-01-01',
      '00000000-0000-0000-0000-0000000000d1/a2.png', 'a2.png', repeat('d', 64)
    )$$,
  '23514',
  null,
  'recusa fim antes do início'
);
select throws_ok(
  $$insert into public.atividades (
      aluno_id, nome, item_numero, quantidade, data_inicio, data_fim,
      comprovante_caminho, comprovante_nome, comprovante_hash
    ) values (
      '00000000-0000-0000-0000-0000000000d2', 'Em nome da Bia', 7, 10, '2025-01-01', '2025-01-02',
      '00000000-0000-0000-0000-0000000000d2/b1.pdf', 'b1.pdf', repeat('e', 64)
    )$$,
  '42501',
  null,
  'a Ana não registra atividade em nome da Bia'
);
select lives_ok(
  $$select public.registrar_atividade(
      'Mesmo certificado de novo', 7, 32, '2025-04-07', '2025-05-03',
      '00000000-0000-0000-0000-0000000000d1/a2.png', 'certificado-git.png', repeat('a', 64)
    )$$,
  'aceita comprovante com hash repetido (RF42 só avisa)'
);

-- Correção com o `updated_at` lido: bate, uma linha; não bate, zero linhas (conflito).
select results_eq(
  $$update public.atividades
       set quantidade = 40
     where comprovante_caminho = '00000000-0000-0000-0000-0000000000d1/a1.pdf'
       and updated_at = (select updated_at from public.atividades
                          where comprovante_caminho = '00000000-0000-0000-0000-0000000000d1/a1.pdf')
    returning quantidade$$,
  $$values (40::numeric)$$,
  'corrige quando o updated_at lido é o atual'
);
select is_empty(
  $$update public.atividades
       set quantidade = 50
     where comprovante_caminho = '00000000-0000-0000-0000-0000000000d1/a1.pdf'
       and updated_at = '2000-01-01T00:00:00Z'
    returning id$$,
  'não corrige com um updated_at velho'
);

select ok(
  public.aluno_tem_atividades('00000000-0000-0000-0000-0000000000d1'),
  'RF10: a Ana tem atividades'
);

-- Como a Bia: não vê, não corrige e não remove nada da Ana.
select set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-0000-0000-0000000000d2","role":"authenticated"}',
  true
);

select is(
  (select count(*)::int from public.atividades),
  0,
  'a Bia não lê as atividades da Ana'
);
select is_empty(
  $$update public.atividades set nome = 'invadido' returning id$$,
  'a Bia não corrige as atividades da Ana'
);
select is_empty(
  $$delete from public.atividades returning id$$,
  'a Bia não remove as atividades da Ana'
);
select ok(
  not public.aluno_tem_atividades('00000000-0000-0000-0000-0000000000d1'),
  'RF10 por RPC não revela as atividades de outro aluno'
);

-- RF33: apagar a conta leva as atividades junto.
reset role;
delete from auth.users where id = '00000000-0000-0000-0000-0000000000d1';
select is(
  (select count(*)::int from public.atividades
    where aluno_id = '00000000-0000-0000-0000-0000000000d1'),
  0,
  'apagar a conta apaga as atividades'
);

select * from finish();

rollback;

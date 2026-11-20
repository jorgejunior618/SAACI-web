-- Limpeza dos comprovantes: a lista traz só arquivo sem atividade e mais velho que a folga, e só a
-- `service_role` a lê, porque ela revela caminhos de todos os alunos. Rode com `pnpm test:db`.
begin;

create extension if not exists pgtap with schema extensions;

select plan(10);

-- Permissão: a lista é só da rotina.
select ok(
  not has_function_privilege('anon', 'public.comprovantes_orfaos(interval, integer)', 'execute'),
  'o visitante não lista comprovantes sem atividade'
);
select ok(
  not has_function_privilege(
    'authenticated', 'public.comprovantes_orfaos(interval, integer)', 'execute'
  ),
  'o aluno não lista comprovantes sem atividade'
);
select ok(
  has_function_privilege('service_role', 'public.comprovantes_orfaos(interval, integer)', 'execute'),
  'a rotina (service_role) lista'
);

-- Agendamento: de hora em hora, sem URL nem segredo no texto do job.
select is(
  (select schedule from cron.job where jobname = 'limpar-comprovantes-orfaos'),
  '15 * * * *',
  'a limpeza roda de hora em hora'
);
select ok(
  (select command from cron.job where jobname = 'limpar-comprovantes-orfaos')
    like '%vault.decrypted_secrets%',
  'a URL e o segredo vêm do Vault, não do repositório'
);

-- Fixture: dois alunos no curso-piloto. Arquivos com idade explícita, porque `now()` é o mesmo em toda
-- a transação.
insert into auth.users (id, email, email_confirmed_at)
values
  ('00000000-0000-0000-0000-000000000b01', 'ana@aluno.ifce.edu.br', now()),
  ('00000000-0000-0000-0000-000000000b02', 'bia@aluno.ifce.edu.br', now());

update public.perfis
   set curso_id = '3b1f6d2e-5a47-4c80-9e1b-7d0c2a4f8e11', semestre_inicio = '2023-07-01'
 where aluno_id in ('00000000-0000-0000-0000-000000000b01', '00000000-0000-0000-0000-000000000b02');

insert into storage.objects (bucket_id, name, owner_id, metadata, created_at)
values
  -- velho e com atividade: fica
  ('comprovantes', '00000000-0000-0000-0000-000000000b01/com-atividade.pdf',
   '00000000-0000-0000-0000-000000000b01', '{"size": 1000, "mimetype": "application/pdf"}',
   now() - interval '3 hours'),
  -- velho e sem atividade (a RPC falhou): sai
  ('comprovantes', '00000000-0000-0000-0000-000000000b01/sem-atividade.pdf',
   '00000000-0000-0000-0000-000000000b01', '{"size": 1000, "mimetype": "application/pdf"}',
   now() - interval '2 hours'),
  -- novo e sem atividade (o registro ainda espera a RPC): fica dentro da folga
  ('comprovantes', '00000000-0000-0000-0000-000000000b01/em-andamento.pdf',
   '00000000-0000-0000-0000-000000000b01', '{"size": 1000, "mimetype": "application/pdf"}',
   now() - interval '10 minutes'),
  -- da Bia, com atividade, até a conta ser apagada
  ('comprovantes', '00000000-0000-0000-0000-000000000b02/da-bia.pdf',
   '00000000-0000-0000-0000-000000000b02', '{"size": 1000, "mimetype": "application/pdf"}',
   now() - interval '4 hours');

insert into public.atividades (
  aluno_id, nome, item_numero, quantidade, data_inicio, data_fim,
  comprovante_caminho, comprovante_nome, comprovante_hash
) values
  ('00000000-0000-0000-0000-000000000b01', 'Curso com comprovante', 7, 32, '2025-04-07', '2025-05-03',
   '00000000-0000-0000-0000-000000000b01/com-atividade.pdf', 'com-atividade.pdf', repeat('a', 64)),
  ('00000000-0000-0000-0000-000000000b02', 'Curso da Bia', 7, 40, '2025-04-07', '2025-05-03',
   '00000000-0000-0000-0000-000000000b02/da-bia.pdf', 'da-bia.pdf', repeat('b', 64));

set local role service_role;

select results_eq(
  $$select * from public.comprovantes_orfaos(interval '1 hour', 100)$$,
  $$values ('00000000-0000-0000-0000-000000000b01/sem-atividade.pdf'::text)$$,
  'lista só o arquivo velho sem atividade'
);
select results_eq(
  $$select * from public.comprovantes_orfaos(interval '5 minutes', 100)$$,
  $$values
      ('00000000-0000-0000-0000-000000000b01/sem-atividade.pdf'::text),
      ('00000000-0000-0000-0000-000000000b01/em-andamento.pdf'::text)$$,
  'sem a folga, o upload em andamento também entra, do mais velho para o mais novo'
);
select is(
  (select count(*)::int from public.comprovantes_orfaos(interval '5 minutes', 1)),
  1,
  'respeita o limite do lote'
);

-- RF33: apagar a conta leva as atividades, e o arquivo dela passa a ser sem atividade.
reset role;
delete from auth.users where id = '00000000-0000-0000-0000-000000000b02';
set local role service_role;

select ok(
  '00000000-0000-0000-0000-000000000b02/da-bia.pdf'
    in (select * from public.comprovantes_orfaos(interval '1 hour', 100)),
  'o arquivo de conta apagada entra na limpeza'
);
select ok(
  '00000000-0000-0000-0000-000000000b01/com-atividade.pdf'
    not in (select * from public.comprovantes_orfaos(interval '1 hour', 100)),
  'arquivo com atividade nunca entra'
);

select * from finish();

rollback;

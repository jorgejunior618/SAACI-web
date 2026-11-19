-- Limpeza dos comprovantes sem atividade (RNF24, RF33, RNF05). Sobram arquivos no bucket em três
-- casos: a RPC `registrar_atividade` falhou depois do upload, a remoção da atividade apagou a linha mas
-- não o arquivo, e a conta foi apagada (o cascade leva as atividades, não os arquivos). O Storage
-- recusa `delete` direto em `storage.objects` (doc/rls-e-permissoes.md), e apagar só a linha deixaria o
-- arquivo no disco. Por isso o SQL só lista; quem apaga é a Edge Function `limpa-comprovantes`, pela
-- API do Storage, com a chave secret do ambiente da função.

-- Lista os arquivos do bucket sem atividade que os referencie, mais velhos que `idade`. A folga cobre
-- o upload que ainda espera a RPC: sem ela, a rotina apagaria o arquivo de um registro em andamento.
-- Conta apagada entra aqui também, porque o cascade já tirou as atividades dela.
-- `security invoker`: só a `service_role` executa, e ela já enxerga tudo sem RLS.
create function public.comprovantes_orfaos(
  idade interval default interval '1 hour',
  limite integer default 100
)
returns setof text
language sql
stable
set search_path = ''
as $$
  select o.name
    from storage.objects o
   where o.bucket_id = 'comprovantes'
     and o.created_at < now() - idade
     and not exists (
       select 1 from public.atividades a where a.comprovante_caminho = o.name
     )
   order by o.created_at
   limit limite;
$$;

-- Função em `public` vira RPC pública por padrão, e esta revela caminhos de todos os alunos.
revoke execute on function public.comprovantes_orfaos(interval, integer)
  from public, anon, authenticated;
grant execute on function public.comprovantes_orfaos(interval, integer) to service_role;

-- O `pg_cron` chama a Edge Function por HTTP.
create extension if not exists pg_net;

-- De hora em hora, aos 15 minutos. A URL da função e o segredo que ela confere ficam no Vault, nunca
-- no repositório (README, seção "Limpeza dos comprovantes"). Sem os dois segredos, o job não faz
-- nada: o banco recém-criado não chama URL nenhuma. O nome torna o agendamento idempotente.
select cron.schedule(
  'limpar-comprovantes-orfaos',
  '15 * * * *',
  $$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'limpeza_url'),
    headers := jsonb_build_object(
      'content-type', 'application/json',
      'x-limpeza-segredo',
      (select decrypted_secret from vault.decrypted_secrets where name = 'limpeza_segredo')
    ),
    body := '{}'::jsonb
  )
  where exists (select 1 from vault.decrypted_secrets where name = 'limpeza_url')
    and exists (select 1 from vault.decrypted_secrets where name = 'limpeza_segredo');
  $$
);

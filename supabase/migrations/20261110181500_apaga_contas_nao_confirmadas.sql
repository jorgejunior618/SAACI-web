-- RNF27: conta que não confirmou o e-mail em 7 dias é apagada, e o mesmo e-mail pode se cadastrar de
-- novo. A confirmação é obrigatória (RF03), então essa conta nunca entrou e não tem dado do aluno.
-- O prazo vive aqui e na ADR 0003, e o texto dos e-mails não o cita.

create extension if not exists pg_cron;

-- Apaga as contas sem e-mail confirmado criadas há mais que `prazo` e devolve quantas apagou.
-- O `prazo` é parâmetro para o teste poder variá-lo; o padrão é o do RNF27.
-- `security definer` porque apagar em `auth.users` exige o dono do schema, e o `search_path` vazio
-- impede que um objeto homônimo em outro schema desvie a função.
create or replace function public.apagar_contas_nao_confirmadas(prazo interval default '7 days')
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  apagadas integer;
begin
  with removidas as (
    delete from auth.users
    where email_confirmed_at is null
      and created_at < now() - prazo
    returning 1
  )
  select count(*) into apagadas from removidas;

  return apagadas;
end;
$$;

-- Função em `public` vira RPC pública por padrão, e esta apaga usuário: só o dono executa. O job do
-- pg_cron roda como o dono, então não precisa de grant.
revoke execute on function public.apagar_contas_nao_confirmadas(interval) from public, anon, authenticated;

-- Todo dia às 03:00 UTC (00:00 em Fortaleza). O nome torna o agendamento idempotente: rodar a
-- migration de novo troca o job em vez de duplicar.
select cron.schedule(
  'apagar-contas-nao-confirmadas',
  '0 3 * * *',
  $$select public.apagar_contas_nao_confirmadas()$$
);
